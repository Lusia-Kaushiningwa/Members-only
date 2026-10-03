require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const flash = require('connect-flash');
const passport = require('./config/passport');
const pool = require('./db/pool');
const indexRouter = require('./routes/indexRouter');

const app = express();
app.locals.currentUser = null;
app.locals.successMessages = [];
app.locals.errorMessages = [];

// ---------- View engine ----------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---------- Middleware ----------
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    store: new pgSession({ pool, tableName: 'session' }),
    secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      secure: process.env.NODE_ENV === 'production',
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Make the logged-in user and flash messages available in every view
// without having to pass them from each controller manually.
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.successMessages = req.flash('success');
  res.locals.errorMessages = req.flash('error');
  next();
});

// ---------- Routes ----------
app.use('/', indexRouter);

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).render('404');
});

// ---------- Error handler ----------
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render('error', { error: process.env.NODE_ENV === 'production' ? null : err });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Members Only app listening on http://localhost:${PORT}`);
});
