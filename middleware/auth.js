// Small guard functions used in route definitions.
// Each one either lets the request continue (next()) or redirects with a
// flash message explaining why not.

function ensureLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  req.flash('error', 'You must be logged in to do that.');
  return res.redirect('/login');
}

function ensureLoggedOut(req, res, next) {
  if (!req.isAuthenticated()) return next();
  return res.redirect('/');
}

function ensureMember(req, res, next) {
  if (req.isAuthenticated() && (req.user.membership_status || req.user.is_admin)) {
    return next();
  }
  req.flash('error', 'You must be a club member to do that.');
  return res.redirect('/');
}

function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.is_admin) return next();
  req.flash('error', 'Admins only.');
  return res.redirect('/');
}

module.exports = { ensureLoggedIn, ensureLoggedOut, ensureMember, ensureAdmin };
