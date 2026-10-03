const { Router } = require('express');
const authController = require('../controllers/authController');
const messageController = require('../controllers/messageController');
const { ensureLoggedIn, ensureLoggedOut, ensureAdmin } = require('../middleware/auth');

const router = Router();

// ---------- Home: list all messages (visible to everyone) ----------
router.get('/', messageController.listMessages);

// ---------- Sign up ----------
router.get('/sign-up', ensureLoggedOut, authController.getSignUpForm);
router.post('/sign-up', ensureLoggedOut, authController.validateSignUp, authController.postSignUpForm);

// ---------- Login / logout ----------
router.get('/login', ensureLoggedOut, authController.getLoginForm);
router.post('/login', ensureLoggedOut, authController.postLoginForm);
router.post('/logout', authController.logout);

// ---------- Join the club (become a member) ----------
router.get('/join', ensureLoggedIn, authController.getJoinForm);
router.post('/join', ensureLoggedIn, authController.postJoinForm);

// ---------- Become an admin ----------
router.get('/become-admin', ensureLoggedIn, authController.getAdminForm);
router.post('/become-admin', ensureLoggedIn, authController.postAdminForm);

// ---------- Messages ----------
router.get('/messages/new', ensureLoggedIn, messageController.getNewMessageForm);
router.post(
  '/messages/new',
  ensureLoggedIn,
  messageController.validateMessage,
  messageController.postNewMessage
);
router.post('/messages/:id/delete', ensureAdmin, messageController.postDeleteMessage);

module.exports = router;
