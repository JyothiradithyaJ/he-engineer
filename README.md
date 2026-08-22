# Dayflow — HR Management System

*Every workday, perfectly aligned.*

A full-stack HRMS built for the hackathon brief in `Dayflow - Human Resource Management System.pdf`.
It covers every functional requirement in that document (auth, role-based dashboards, profile
management, attendance, leave, payroll) plus an AI HR assistant powered by **Groq**, and a
handful of extras (analytics, notifications, CSV exports, search) aimed at making HR's day faster.

---

## 1. What's inside

```
dayflow-hrms/
├── backend/     Node + Express API, SQLite database (better-sqlite3), JWT auth, Groq chatbot
├── frontend/    React + Vite + Tailwind SPA
└── docker-compose.yml
```

### Requirement → feature map

| Spec section | Implemented as |
|---|---|
| 3.1 Sign up / Sign in | `/register`, `/login` — employee ID, email, password, role; bcrypt + JWT |
| 3.2 Dashboard | Role-aware `/app` — employee quick cards vs. admin org overview |
| 3.3 Profile management | `/app/profile` — self-service edit (phone/address/photo), admin can edit anything |
| 3.4 Attendance | `/app/attendance` — check-in/out, daily & weekly & admin org-wide views |
| 3.5 Leave & time-off | `/app/leave` — apply, Pending/Approved/Rejected, comments, auto-marks attendance |
| 3.6 Payroll | `/app/payroll` — employee read-only, admin can edit structure & generate payslips |
| Notifications | Bell icon in the app shell, backed by a `notifications` table |
| Analytics & reports | `/app/analytics` (admin) — attendance trend, headcount, leave breakdowns |
| **Chatbot (added)** | Floating assistant in every screen, calls Groq with the signed-in user's own data as context |

### Extra features added beyond the spec
- **Notifications center** — leave approvals/rejections, new payslips, welcome message.
- **Analytics dashboard** — attendance trend, headcount by department, leave by status/type (Recharts).
- **CSV export** — attendance, payroll and employee lists, for admins.
- **Global employee search & department filter** — for the admin employee directory.
- **Groq-powered HR assistant** — context-aware (knows the user's recent attendance/leave, not
  a generic chatbot), reachable from a floating button on every page.

---

## 2. Quick start (local)

You need Node.js 18+ and a free [Groq API key](https://console.groq.com/keys) (optional — the
app runs fine without one, the chatbot just says it isn't configured yet).

### Backend
```bash
cd backend
cp .env.example .env      # then fill in JWT_SECRET and GROQ_API_KEY
npm install
npm start                 # http://localhost:5000
```
The SQLite database is created automatically on first run at `backend/data/dayflow.db`, seeded
with two demo accounts so you can log in immediately:

| Role | Email | Password |
|---|---|---|
| HR Admin | `admin@dayflow.dev` | `Password123` |
| Employee | `employee@dayflow.dev` | `Password123` |

### Frontend
```bash
cd frontend
cp .env.example .env      # point VITE_API_URL at your backend
npm install
npm run dev                # http://localhost:5173
```

Open `http://localhost:5173`, sign in with a demo account (or register a new one), and you're in.

---

## 3. Running with Docker

```bash
cp backend/.env.example .env   # edit JWT_SECRET / GROQ_API_KEY at the repo root
docker compose up --build
```
- Backend → `http://localhost:5000`
- Frontend → `http://localhost:4173`

The SQLite file persists in a named Docker volume (`dayflow-data`) across restarts.

---

## 4. Deploying for real

**Backend** (any Node host — Render, Railway, Fly.io, a VPS):
1. Deploy the `backend/` folder (or its Dockerfile).
2. Set env vars: `JWT_SECRET`, `GROQ_API_KEY`, `GROQ_MODEL`, `CLIENT_ORIGIN` (your frontend's URL).
3. SQLite writes to `backend/data/` — make sure that path is on persistent storage (a mounted
   volume/disk), not an ephemeral filesystem, or attach the free Render/Railway disk add-on.

**Frontend** (Vercel, Netlify, Cloudflare Pages, or the included Dockerfile):
1. Build command `npm run build`, output directory `dist/`.
2. Set `VITE_API_URL` to your deployed backend's `/api` URL at build time.

**Groq API key**: get one free at [console.groq.com/keys](https://console.groq.com/keys). Model
names change over time — check [console.groq.com/docs/models](https://console.groq.com/docs/models)
and adjust `GROQ_MODEL` in `backend/.env` if the default (`llama-3.3-70b-versatile`) has been retired.

---

## 5. Design notes

The landing, login and register pages combine the two references you shared: the split-screen
form layout from the "Crextio" template, restyled in the deep teal / amber palette and agentic
AI positioning of the "AlphaWave" template — reworked into a distinct **Dayflow** identity (deep
ink teal `#0B1E23`, brand teal `#0E7C86`, amber accent `#F5B500`), with a signature "week flow"
line motif that threads through the hero, sign-in and sign-up screens to visualize attendance.

## 6. Tech stack

- **Backend**: Node.js, Express, better-sqlite3, bcryptjs, jsonwebtoken, groq-sdk
- **Frontend**: React 18, React Router, Tailwind CSS, Recharts, Axios, Vite
- **Auth**: JWT (7-day expiry), bcrypt-hashed passwords, role-based route guards on both ends
