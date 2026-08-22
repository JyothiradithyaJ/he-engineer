# Dayflow HRMS — Backend Setup

## What changed and why

Your original error had nothing to do with your code. It happened because
`better-sqlite3` is a **native module** — it needs to be compiled with a
C++ compiler (`node-gyp`), and no ready-made ("prebuilt") binary existed for
your Node.js version (v24.15.0) on Windows. Compiling from source requires
Visual Studio's C++ build tools, which weren't installed on your machine.

**The fix:** the database layer has been rewritten to use `node:sqlite`,
which is built directly into Node.js itself (available since Node v22.5).
There is nothing to compile and nothing to download for the database —
it just works, on any machine, with any recent Node version.

External APIs: the only external API this project talks to is **Groq**
(for the HR chatbot). There were no other third-party API integrations to
remove.

## Requirements

- Node.js **v22.5.0 or newer** (v24 is fine)
- A free Groq API key from https://console.groq.com/keys (only needed for
  the chatbot feature — everything else works without it)

## Install

1. Open a terminal in the `backend` folder.
2. Install the pinned dependencies one of two ways:

   **Option A — plain npm (recommended):**
   ```
   npm install
   ```

   **Option B — install exactly from requirements.txt:**
   ```
   node install-from-requirements.js
   ```
   This reads `requirements.txt` and installs those exact pinned versions
   with `npm install <pkg>@<version> --save-exact`, so you get precisely
   what was tested — no surprises from caret (`^`) ranges resolving to a
   newer, untested release.

   Either way, installation should complete in a few seconds with **no**
   compiler warnings or `node-gyp` errors, because there's no native module
   left in the dependency tree.

3. Copy the environment file and add your Groq key:
   ```
   copy .env.example .env
   ```
   Then open `.env` and set `GROQ_API_KEY=your-key-here`.

4. Start the server:
   ```
   npm run dev
   ```
   You should see: `Dayflow HRMS backend running on port 5000`
   (You may see one harmless line: `ExperimentalWarning: SQLite is an
   experimental feature` — that's just Node.js flagging that `node:sqlite`
   is a newer built-in API. It doesn't affect functionality.)

5. On first run, the database is created automatically at
   `backend/data/dayflow.db` and seeded with two demo logins:
   - Admin: `admin@dayflow.dev` / `Password123`
   - Employee: `employee@dayflow.dev` / `Password123`

## Files added for this fix

- `requirements.txt` — pinned, documented list of every backend dependency
  and what it's for
- `install-from-requirements.js` — installs exactly those pinned versions
- `db.js` — now uses `node:sqlite` instead of `better-sqlite3`
