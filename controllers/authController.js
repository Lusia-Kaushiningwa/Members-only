const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const { createUser, findUserByEmail, setMembershipStatus, setAdminStatus } = require('../db/userQueries');

const MEMBERSHIP_SECRET = process.env.MEMBERSHIP_SECRET || 'cheese_pizza';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'super_secret_admin_code';

// ---------- Sign up ----------

const validateSignUp = [
  body('firstName').trim().notEmpty().withMessage('First name is required.').isLength({ max: 100 }),
  body('lastName').trim().notEmpty().withMessage('Last name is required.').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('A valid email is required.').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
  // Custom validator: confirmPassword must match password.
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match.');
    }
    return true;
  }),
];

function getSignUpForm(req, res) {
  res.render('sign-up-form', { errors: [], formData: {} });
}

async function postSignUpForm(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render('sign-up-form', {
      errors: errors.array(),
      formData: req.body,
    });
  }

  try {
    const existingUser = await findUserByEmail(req.body.email);
    if (existingUser) {
      return res.status(400).render('sign-up-form', {
        errors: [{ msg: 'An account with that email already exists.' }],
        formData: req.body,
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    await createUser({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      hashedPassword,
      // Checkbox on the sign-up form, per assignment step 8.
      isAdmin: req.body.isAdmin === 'on',
    });

    req.flash('success', 'Account created! You can now log in.');
    res.redirect('/login');
  } catch (err) {
    next(err);
  }
}

// ---------- Login / logout ----------

function getLoginForm(req, res) {
  res.render('login-form', { errors: [] });
}

function postLoginForm(req, res, next) {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(400).render('login-form', {
        errors: [{ msg: info?.message || 'Incorrect email or password.' }],
      });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect('/');
    });
  })(req, res, next);
}

function logout(req, res, next) {
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success', 'You have been logged out.');
    res.redirect('/');
  });
}

// ---------- Join the club / become admin ----------

function getJoinForm(req, res) {
  res.render('join-form', { error: null });
}

async function postJoinForm(req, res, next) {
  try {
    if (req.body.passcode === MEMBERSHIP_SECRET) {
      await setMembershipStatus(req.user.id, true);
      req.flash('success', 'Welcome to the club! You can now see who wrote each message.');
      return res.redirect('/');
    }
    return res.status(400).render('join-form', { error: 'Incorrect passcode. Try again.' });
  } catch (err) {
    next(err);
  }
}

function getAdminForm(req, res) {
  res.render('admin-form', { error: null });
}

async function postAdminForm(req, res, next) {
  try {
    if (req.body.passcode === ADMIN_SECRET) {
      await setAdminStatus(req.user.id, true);
      req.flash('success', 'You are now an admin.');
      return res.redirect('/');
    }
    return res.status(400).render('admin-form', { error: 'Incorrect passcode. Try again.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  validateSignUp,
  getSignUpForm,
  postSignUpForm,
  getLoginForm,
  postLoginForm,
  logout,
  getJoinForm,
  postJoinForm,
  getAdminForm,
  postAdminForm,
};
