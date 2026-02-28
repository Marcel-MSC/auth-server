<p align="center">
  <a href="" rel="noopener">
 <img width=200px height=200px src="./imageReadme/logo.jpg" alt="Project logo"></a>
</p>

<h3 align="center">auth-server</h3>

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

---

<p align="center">A simple auth server for learning JWT, server-side authentication, user creation, token verification, and account (email) checks.
    <br>
</p>

## 📝 Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Environment](#environment)
- [API](#api)
- [Usage](#usage)
- [Authors](#authors)
- [Implementation log](#implementation_log)

## 🧐 About <a name = "about"></a>

This project uses **Express**, **jsonwebtoken**, **bcryptjs**, **cors**, and **lowdb** to provide a minimal auth API that can:

- Create users (email + password, hashed with bcrypt)
- Authenticate users and issue JWTs (7-day expiry)
- Verify JWT tokens via standard `Authorization: Bearer <token>` header
- Check if an account (email) exists
- Remove users

Tokens expire after 7 days. The server validates `JWT_SECRET_KEY` at startup and will not start without it.

## 🏁 Getting Started <a name = "getting_started"></a>

### Prerequisites

- Node.js (ES modules)
- npm

### Installing

```bash
git clone <repository-url>
cd auth-server
npm i
```

### Running

1. Copy the environment template and set your JWT secret:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set `JWT_SECRET_KEY` to a long, random string.

2. Start the server:

   ```bash
   npm run dev
   ```

   By default the server listens on port **3080**. You can override with the `PORT` environment variable (e.g. `PORT=3000 npm run dev`).

## Environment <a name = "environment"></a>

| Variable         | Required | Description                                      |
|------------------|----------|--------------------------------------------------|
| `JWT_SECRET_KEY` | Yes      | Secret used to sign and verify JWT tokens.       |
| `PORT`           | No       | Port to listen on. Default: `3080`.             |

Use `.env.example` as a template; never commit `.env` or real secrets.

## API <a name = "api"></a>

Base URL: `http://localhost:3080` (or your `PORT`).

| Method | Endpoint           | Description                          |
|--------|--------------------|--------------------------------------|
| GET    | `/`                | API documentation (HTML).            |
| POST   | `/create-user`     | Create user (body: `email`, `password`). |
| POST   | `/auth`            | Login (body: `email`, `password`). Returns `token`. |
| POST   | `/verify`          | Verify JWT. Header: `Authorization: Bearer <token>`. |
| GET    | `/check-account`   | Check if email exists. Query: `?email=...`. |
| DELETE | `/remove-user`     | Remove user. Body: `{ "email": "..." }`. |

- **Verify** requires the standard header: `Authorization: Bearer <your-jwt-token>`.
- **check-account** uses a query parameter: `GET /check-account?email=user@example.com`.

Full endpoint details are also shown on `GET /` in the browser.

## 🎈 Usage <a name="usage"></a>

Use this auth server for user authentication in your apps. You can call it as an API from any client (e.g. Insomnia, Postman, or your frontend). Create users with `/create-user`, log in with `/auth` to get a JWT, then send that token in the `Authorization: Bearer <token>` header when calling `/verify` or other protected flows.

## ✍️ Authors <a name = "authors"></a>

- [@Marcel-MSC](https://github.com/Marcel-MSC) - Idea & Initial work

## 📄 Implementation log <a name = "implementation_log"></a>

For a detailed log of recent improvements (JWT expiry, env validation, Bearer token, query params, `.env.example`, etc.), see [docs/IMPLEMENTATION.md](docs/IMPLEMENTATION.md).
