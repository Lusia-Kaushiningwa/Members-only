# Members Only

The Odin Project — "Members Only" exclusive clubhouse. Anyone can read the
anonymous stories posted on the wall, but only logged-in **members** can see
who wrote them and when. **Admins** can additionally delete any message.

## Stack

- Node.js + Express
- PostgreSQL (via `pg`, no ORM — raw SQL in `db/*Queries.js`)
- EJS templates
- Passport.js (`passport-local`) for authentication
- `bcryptjs` for password hashing
- `express-validator` for form validation/sanitization
- `express-session` + `connect-pg-simple` for sessions stored in Postgres
- `connect-flash` for one-time flash messages

## Data model

**users**
| column | type | notes |
|---|---|---|
| id | serial PK | |
| first_name | varchar | |
| last_name | varchar | |
| email | varchar unique | used as the login username |
| password | varchar | bcrypt hash, never the raw password |
| membership_status | boolean | `false` until they enter the club passcode |
| is_admin | boolean | `false` unless checked at signup or unlocked via `/become-admin` |
| created_at | timestamp | |

**messages**
| column | type | notes |
|---|---|---|
| id | serial PK | |
| title | varchar | |
| text | text | |
| timestamp | timestamp | defaults to `NOW()` |
| user_id | integer FK → users.id | author |

See `db/schema.sql` for the full DDL (also includes the `session` table used
by `connect-pg-simple`).

## Local setup

1. **Install Postgres** locally (or use a free hosted instance — Neon,
   Supabase, Railway, etc. all work) and create a database:
   ```bash
   createdb members_only
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables.** Copy `.env.example` to `.env` and
   fill in your real database credentials and a random `SESSION_SECRET`:
   ```bash
   cp .env.example .env
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # paste the output in as SESSION_SECRET
   ```
   Also set `MEMBERSHIP_SECRET` and `ADMIN_SECRET` to whatever passcodes you
   want your club and admin passcodes to be.

4. **Create the tables:**
   ```bash
   npm run db:init
   ```
   This just runs `db/schema.sql` against your database. You can re-run it
   safely — every statement is `IF NOT EXISTS`.

5. **Run the app:**
   ```bash
   npm run dev   # nodemon, auto-restarts on changes
   # or
   npm start
   ```
   Visit `http://localhost:3000`.

## How the permission model works

- **Everyone** (logged out or not) can see the home page and every message's
  title and text.
- **Logged-in users** additionally get a "Create a new message" link and a
  "Join the club" link (until they're already a member).
- **Members** (`membership_status = true`) see each message's real author
  name and timestamp instead of "a mysterious club member". They unlock this
  by visiting `/join` and entering `MEMBERSHIP_SECRET`.
- **Admins** (`is_admin = true`) see everything members see, plus a Delete
  button on every message. You can become an admin either by checking the
  "Sign up as an admin" box on the sign-up form, or later via `/become-admin`
  and entering `ADMIN_SECRET`.

All of this is enforced server-side (in `middleware/auth.js` and the
controllers), not just hidden in the UI — the delete route itself checks
`req.user.is_admin` before doing anything.

## Deployment

This app is a normal Express server, so it deploys to any Node-friendly PaaS
(Render, Railway, Fly.io, Heroku, etc.). General steps:

1. Push this project to a Git repository (GitHub/GitLab).
2. Create a new PostgreSQL database on your chosen provider (or use a
   separate provider like Neon/Supabase) and copy its connection string into
   `DATABASE_URL`.
3. Create a new "Web Service" (or equivalent) pointing at your repo, with:
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment variables: `DATABASE_URL`, `PG_SSL=true` (most hosted
     Postgres requires SSL), `SESSION_SECRET`, `MEMBERSHIP_SECRET`,
     `ADMIN_SECRET`, `NODE_ENV=production`.
4. Run the schema once against the production database — either by
   temporarily setting the start command to `npm run db:init && npm start`
   for the first deploy, or by running `npm run db:init` locally with
   `DATABASE_URL` pointed at the production database.
5. Deploy, then visit the live URL, sign up, join the club, and start
   posting.

## Project structure

```
app.js                     Express app setup, sessions, error handling
config/passport.js         passport-local strategy + (de)serialize
middleware/auth.js         ensureLoggedIn / ensureMember / ensureAdmin guards
controllers/
  authController.js        sign-up, login, logout, join, become-admin
  messageController.js     list / create / delete messages
db/
  pool.js                  pg Pool, reads DATABASE_URL or PG* env vars
  schema.sql                table definitions
  init.js                  runs schema.sql (npm run db:init)
  userQueries.js           raw SQL for the users table
  messageQueries.js        raw SQL for the messages table
routes/indexRouter.js      all routes, wired to controllers + middleware
views/                     EJS templates
public/css/style.css       styling
```
