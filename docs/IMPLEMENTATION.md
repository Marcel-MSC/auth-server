# Implementation Tracking

## Quick Wins

- [x] Add `datatable.json` to `.gitignore`.
- [x] Add JWT `expiresIn` in `jwt.sign()`.
- [x] Validate `JWT_SECRET_KEY` at startup.
- [x] Fix `GET /check-account` to use query params (`req.query.email`).
- [x] Use `Authorization: Bearer <token>` instead of `tokenheaderkey` (optional, more standard).
- [x] Create `.env.example` with `JWT_SECRET_KEY` and `PORT`.

---

## Implementation Log

### 1. Add `datatable.json` to `.gitignore`

**What was done:**
- Added `datatable.json` to `.gitignore` under a new `# data` section.
- Normalized the `#variables` comment to `# variables` for consistency with other section headers.

**Why:**
- `datatable.json` is the LowDB storage file created at runtime (`JSONFilePreset('datatable.json', defaultData)`).
- It contains user data (emails and bcrypt-hashed passwords), which is **sensitive** and should never be committed to version control.
- Committing it would expose user credentials, create merge conflicts when multiple developers run the app, and pollute the repo with generated/runtime data.

**Note:** If `datatable.json` was already committed, run `git rm --cached datatable.json` to stop tracking it (the file stays on disk but is no longer versioned).

### 2. Add JWT `expiresIn` in `jwt.sign()`

**What was done:**
- Added `{ expiresIn: '7d' }` as the third argument to `jwt.sign()` in the `/auth` route.

**Why:**
- Without `expiresIn`, JWTs never expire. A stolen or leaked token would remain valid indefinitely.
- `7d` (7 days) is a common balance: users don't have to re-login too often, but tokens are invalidated within a week, limiting the window for abuse.
- `jwt.verify()` already respects the `exp` claim; expired tokens will throw, which `/verify` catches and returns 401—no code changes needed there.

### 3. Validate `JWT_SECRET_KEY` at startup

**What was done:**
- Added a startup check right after reading `JWT_SECRET_KEY` from `process.env`.
- If missing or empty (including whitespace-only), the app logs `FATAL: JWT_SECRET_KEY must be set in .env` and exits with code 1.

**Why:**
- `jwt.sign()` and `jwt.verify()` require a secret. Passing `undefined` or empty string causes runtime errors on first auth/verify, and can produce weak or predictable tokens.
- Failing fast at startup makes misconfiguration obvious instead of failing only when a user tries to log in.
- `process.exit(1)` prevents the server from starting in an invalid state.

### 4. Fix `GET /check-account` to use query params

**What was done:**
- Switched from `req.body` to `req.query` for the `email` parameter.
- Added validation: if `email` is missing or whitespace-only, return 400 with a clear error message.

**Why:**
- GET requests conventionally use query strings (`?email=user@example.com`), not a body. `req.body` is typically empty on GET, so the previous code always received `undefined` and would always return "User does not exist".
- Aligns with the API docs (`GET /check-account?email=usuario@exemplo.com`).
- Returning 400 when `email` is missing makes the API contract explicit and avoids ambiguous "User does not exist" responses.

### 5. Use `Authorization: Bearer <token>` instead of `tokenheaderkey`

**What was done:**
- Updated `/verify` to read the token from the `Authorization` header using the `Bearer <token>` format.
- Parse `Authorization: Bearer <token>` and extract the token (after the `Bearer ` prefix).
- If the header is missing or not in the expected format, return 401 with a clear message indicating the correct usage.
- Updated the API docs in `views/index.ejs` to reflect the new header.

**Why:**
- `Authorization: Bearer <token>` is the standard RFC 6750 / OAuth 2.0 way to send bearer tokens. Most HTTP clients, proxies, and auth libraries expect it.
- The custom `tokenheaderkey` header is non-standard and can cause integration issues with middleware or tooling that only looks at `Authorization`.
- Using the standard header improves interoperability and makes the API easier to consume.

### 6. Create `.env.example` with `JWT_SECRET_KEY` and `PORT`

**What was done:**
- Created `.env.example` with documented `JWT_SECRET_KEY` and `PORT` variables (placeholder values, no real secrets).
- Updated `app.js` to read `PORT` from `process.env.PORT`, defaulting to `3080` when unset.

**Why:**
- New developers can copy `.env.example` to `.env` and know exactly which variables are required and optional.
- `PORT` from env allows deployment flexibility (e.g. Heroku, Docker, or `PORT=3000 node app.js`) without code changes.
- Keeps `.env` in `.gitignore` while committing a safe template for setup.
