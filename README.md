# AuthTemplate — Next.js 16 Auth Starter

A production-ready, reusable authentication template built on **Next.js 16** (App Router) with full security hardening. Clone it, configure it, and ship.

---

## Features

| Feature | Details |
|---|---|
| Email + Password | bcrypt (salt rounds: 12), Zod validation |
| JWT tokens | Access (15 min) + Refresh (7 days) with rotation |
| Cookie strategy | `httpOnly`, `secure`, `sameSite=strict` — never localStorage |
| OAuth | Google and GitHub (authorization-code flow) |
| Email verification | Token sent on registration, 24-hour TTL |
| Forgot / Reset password | Secure email link, 1-hour TTL |
| Remember me | Extends refresh token to 30 days |
| Rate limiting | 5 attempts per 15-minute window per IP (in-memory) |
| Brute-force lockout | Account locked for 30 min after 5 failed logins |
| Logout | Single-device and all-devices |
| CSRF protection | Double-submit cookie pattern (`X-CSRF-Token` header) |
| Security headers | CSP, HSTS, X-Frame-Options, etc. in `next.config.ts` |
| Route protection | `proxy.ts` guards private routes, redirects unauth users |
| Role-based access | `USER` / `ADMIN` roles enforced in proxy and DAL |
| Input validation | Zod on every endpoint |
| No sensitive leakage | Passwords, tokens never returned in JSON responses |
| Env validation | Zod schema validates all env vars at startup |
| ORM | Prisma 6 + MySQL |

---

## Project Structure

```
├── app/
│   ├── api/auth/          # Route handlers (login, register, OAuth, …)
│   ├── auth/              # Auth pages (login, register, verify-email, …)
│   ├── dashboard/         # Protected user dashboard
│   ├── admin/             # Admin-only page
│   ├── profile/           # Protected profile page
│   └── components/        # UI components and providers
├── lib/
│   ├── auth/              # Session, CSRF, rate-limit, DAL, OAuth helpers
│   ├── db/                # Prisma queries (users, sessions, tokens)
│   └── validations/       # Zod schemas
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts            # Creates default admin user
│   └── migrations/
├── proxy.ts               # Next.js 16 route-protection proxy (replaces middleware.ts)
└── next.config.ts         # Security headers
```

---

## Quick Start

### 1. Clone & install

```bash
git clone <your-repo-url> my-app
cd my-app
npm install
```

### 2. Configure environment

Copy `.env.copy` to `.env` and fill in your database URL.
Edit `.env.local` and fill in all required values:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | MySQL connection string |
| `JWT_ACCESS_SECRET` | Yes | Min 64-char random secret |
| `JWT_REFRESH_SECRET` | Yes | Min 64-char random secret |
| `CSRF_SECRET` | Yes | Min 32-char random secret |
| `APP_URL` | Yes | Public base URL, e.g. `https://myapp.com` |
| `SMTP_*` | Yes | SMTP credentials for email |
| `GOOGLE_CLIENT_ID/SECRET` | Optional | Google OAuth |
| `GITHUB_CLIENT_ID/SECRET` | Optional | GitHub OAuth |

Generate secrets:

```bash
node -e "const c=require('crypto');['JWT_ACCESS_SECRET','JWT_REFRESH_SECRET'].forEach(k=>console.log(k+'='+c.randomBytes(64).toString('hex')));console.log('CSRF_SECRET='+c.randomBytes(32).toString('hex'))"
```

### 3. Create the database

```bash
node scripts/create-db.mjs
```

### 4. Run migrations

```bash
npm run db:migrate
```

### 5. Seed the admin user

```bash
npm run db:seed
# Creates: admin@example.com / Admin@123!  — change this immediately!
```

### 6. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## OAuth Setup

### Google

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create project → APIs & Services → Credentials → OAuth 2.0 Client ID
3. Authorized redirect URI: `{APP_URL}/api/auth/oauth/callback/google`
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`

### GitHub

1. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. Callback URL: `{APP_URL}/api/auth/oauth/callback/github`
3. Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `.env.local`

---

## Email (SMTP)

For development, generate free test credentials at [ethereal.email](https://ethereal.email):

```bash
node -e "const n=require('nodemailer');n.createTestAccount().then(a=>console.log(JSON.stringify(a,null,2)))"
```

For production use SendGrid, Resend, AWS SES, or Postmark — just set the `SMTP_*` env vars.

---

## API Reference

Import `postman-collection.json` into Postman or Insomnia.

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login (sets auth cookies) |
| POST | `/api/auth/logout` | Cookie | Logout current session |
| POST | `/api/auth/logout-all` | Cookie | Revoke all sessions |
| POST | `/api/auth/refresh` | Cookie | Rotate access/refresh tokens |
| POST | `/api/auth/verify-email` | Public | Verify email token |
| POST | `/api/auth/forgot-password` | Public | Send password reset email |
| POST | `/api/auth/reset-password` | Public | Reset password with token |
| GET | `/api/auth/me` | Cookie | Get current user |
| GET | `/api/auth/csrf` | Public | Get CSRF token |
| GET | `/api/auth/oauth/google` | Public | Start Google OAuth |
| GET | `/api/auth/oauth/github` | Public | Start GitHub OAuth |

---

## Reusing This Template

1. Clone this repo into your new project directory
2. Replace `auth_template_db` with your database name in `.env`
3. Update `APP_URL` in `.env.local`
4. Configure SMTP and OAuth credentials
5. Customise pages in `app/auth/` and `app/components/`
6. Add your own pages — automatically protected by `proxy.ts`

To protect a new route, add it to `PROTECTED_ROUTES` in `proxy.ts`.  
To add admin-only access, add it to `ADMIN_ROUTES` in `proxy.ts` and call `requireAdmin()` in the page.

---

## Production Checklist

- [ ] Rotate all secrets in `.env.local`
- [ ] Change the seed admin password
- [ ] Set `NODE_ENV=production`
- [ ] Configure real SMTP credentials
- [ ] Set `APP_URL` to your production domain (HTTPS)
- [ ] Replace in-memory rate limiter with Redis (e.g., [Upstash](https://upstash.com))
- [ ] Set OAuth redirect URIs for your production domain
- [ ] Tighten the Content-Security-Policy in `next.config.ts` as needed
- [ ] Set up database backups

---

## License

MIT
