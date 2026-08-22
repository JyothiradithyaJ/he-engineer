const express = require('express');
const { v4: uuidv4 } = require('uuid');
const Groq = require('groq-sdk');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

let groq = null;
function getGroq() {
  if (!process.env.GROQ_API_KEY) return null;
  if (!groq) groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return groq;
}

// Models that exist on Groq but aren't general-purpose chat models
// (speech-to-text, text-to-speech, safety classifiers) - never auto-pick these.
const NON_CHAT_MODEL_PATTERNS = [/whisper/i, /guard/i, /orpheus/i, /safeguard/i];

let cachedModel = null;
let cachedModelAt = 0;
const MODEL_CACHE_MS = 30 * 60 * 1000; // re-check every 30 minutes

// Figures out which model to actually use: the one configured in .env if it's
// still valid, otherwise auto-picks a working chat model from Groq's live
// catalog. This means the chatbot keeps working even after Groq retires
// whatever model you originally configured.
async function resolveModel(client) {
  const now = Date.now();
  if (cachedModel && now - cachedModelAt < MODEL_CACHE_MS) return cachedModel;

  const preferred = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
  try {
    const list = await client.models.list();
    const ids = (list.data || []).map((m) => m.id);
    const chatCandidates = ids.filter((id) => !NON_CHAT_MODEL_PATTERNS.some((p) => p.test(id)));

    let chosen = chatCandidates.includes(preferred) ? preferred : null;
    if (!chosen) {
      chosen =
        chatCandidates.find((id) => /gpt-oss-20b/i.test(id)) ||
        chatCandidates.find((id) => /gpt-oss/i.test(id)) ||
        chatCandidates[0];
      if (chosen) {
        console.warn(`[Groq] Configured model "${preferred}" is unavailable. Auto-selected "${chosen}" instead. Update GROQ_MODEL in .env to remove this warning.`);
      }
    }
    if (chosen) {
      cachedModel = chosen;
      cachedModelAt = now;
      return chosen;
    }
  } catch (e) {
    console.warn('[Groq] Could not fetch model list, falling back to configured model:', e.message);
  }
  return preferred;
}

function buildContext(user) {
  const leaves = db.prepare(`SELECT leave_type, start_date, end_date, status FROM leaves WHERE user_id = ? ORDER BY created_at DESC LIMIT 5`).all(user.id);
  const attendance = db.prepare(`SELECT date, status, check_in, check_out FROM attendance WHERE user_id = ? ORDER BY date DESC LIMIT 7`).all(user.id);
  const profile = db.prepare(`SELECT name, employee_id, department, designation, base_salary, join_date FROM users WHERE id = ?`).get(user.id);

  let extra = '';
  if (user.role === 'admin') {
    const pending = db.prepare(`SELECT COUNT(*) c FROM leaves WHERE status='Pending'`).get().c;
    const headcount = db.prepare(`SELECT COUNT(*) c FROM users`).get().c;
    extra = `\nOrganization snapshot: ${headcount} total employees, ${pending} leave requests pending approval.`;
  }

  return `You are "Dayflow Assistant", a concise, friendly HR helper embedded inside the Dayflow HRMS product.
Current user: ${profile.name} (${profile.employee_id}), role: ${user.role}, department: ${profile.department}, title: ${profile.designation}, joined: ${profile.join_date}.
Recent attendance (most recent first): ${JSON.stringify(attendance)}.
Recent leave requests: ${JSON.stringify(leaves)}.${extra}

Guidelines:
- Answer questions about the user's own attendance, leave status/balance, payroll basics, and general HR policy (leave types are Paid, Sick, Unpaid; attendance statuses are Present, Absent, Half-day, Leave).
- You can explain how to use the product (e.g. "go to the Leave tab and click Apply for Leave") but you cannot perform actions yourself - guide the user to the right screen/button instead.
- Never invent salary or personal data that wasn't given to you above.
- Keep answers short (2-5 sentences) unless asked for detail. Use a warm, professional tone.
- If asked something outside HR/workplace topics, gently redirect back to how you can help with work matters.`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function askGroq(client, messages, { retryOnRateLimit = true } = {}) {
  const model = await resolveModel(client);
  try {
    return await client.chat.completions.create({
      model,
      temperature: 0.4,
      max_tokens: 400, // kept modest to conserve tokens-per-minute quota
      messages,
    });
  } catch (err) {
    // Model got retired mid-cache-window: drop the cache and retry once with a fresh pick.
    if (err.status === 404) {
      cachedModel = null;
      const freshModel = await resolveModel(client);
      if (freshModel !== model) {
        return client.chat.completions.create({ model: freshModel, temperature: 0.4, max_tokens: 400, messages });
      }
    }
    // Rate limited: back off briefly and retry once.
    if (err.status === 429 && retryOnRateLimit) {
      const waitMs = Number(err.headers?.['retry-after']) * 1000 || 2000;
      await sleep(waitMs);
      return askGroq(client, messages, { retryOnRateLimit: false });
    }
    throw err;
  }
}

router.post('/message', requireAuth, async (req, res) => {
  const { message } = req.body || {};
  if (!message || !message.trim()) return res.status(400).json({ error: 'Message cannot be empty.' });

  const client = getGroq();
  if (!client) {
    return res.status(503).json({
      error: 'The chatbot is not configured yet. Add a GROQ_API_KEY to the backend .env file (see console.groq.com/keys).'
    });
  }

  db.prepare('INSERT INTO chat_messages (id, user_id, role, content) VALUES (?,?,?,?)').run(uuidv4(), req.user.id, 'user', message);

  // Trimmed to 6 turns (down from 10) to keep per-request token usage low.
  const history = db.prepare('SELECT role, content FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT 6')
    .all(req.user.id).reverse();

  try {
    const completion = await askGroq(client, [
      { role: 'system', content: buildContext(req.user) },
      ...history.map((h) => ({ role: h.role, content: h.content })),
    ]);

    const reply = completion.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't come up with a response - try rephrasing that.";
    db.prepare('INSERT INTO chat_messages (id, user_id, role, content) VALUES (?,?,?,?)').run(uuidv4(), req.user.id, 'assistant', reply);
    res.json({ reply });
  } catch (err) {
    console.error('Groq chatbot error:', err.status, err.message);
    if (err.status === 429) {
      return res.status(429).json({ error: 'The chatbot is getting a lot of use right now (rate limit reached). Please try again in a minute.' });
    }
    res.status(502).json({ error: 'The chatbot service is unavailable right now. Please try again shortly.' });
  }
});

router.get('/history', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT role, content, created_at FROM chat_messages WHERE user_id = ? ORDER BY created_at ASC LIMIT 50').all(req.user.id);
  res.json({ messages: rows });
});

module.exports = router;
