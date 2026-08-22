const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
const todayISO = () => new Date().toISOString().slice(0, 10);
const nowHM = () => new Date().toTimeString().slice(0, 5);

// Check-in for today
router.post('/check-in', requireAuth, (req, res) => {
  const date = todayISO();
  const existing = db.prepare('SELECT * FROM attendance WHERE user_id = ? AND date = ?').get(req.user.id, date);
  if (existing && existing.check_in) {
    return res.status(409).json({ error: 'You already checked in today.' });
  }
  if (existing) {
    db.prepare('UPDATE attendance SET check_in = ?, status = ? WHERE id = ?').run(nowHM(), 'Present', existing.id);
  } else {
    db.prepare('INSERT INTO attendance (id, user_id, date, check_in, status) VALUES (?,?,?,?,?)')
      .run(uuidv4(), req.user.id, date, nowHM(), 'Present');
  }
  const row = db.prepare('SELECT * FROM attendance WHERE user_id = ? AND date = ?').get(req.user.id, date);
  res.json({ attendance: row });
});

// Check-out for today
router.post('/check-out', requireAuth, (req, res) => {
  const date = todayISO();
  const existing = db.prepare('SELECT * FROM attendance WHERE user_id = ? AND date = ?').get(req.user.id, date);
  if (!existing || !existing.check_in) return res.status(400).json({ error: 'You need to check in before checking out.' });
  if (existing.check_out) return res.status(409).json({ error: 'You already checked out today.' });

  const checkInMinutes = parseInt(existing.check_in.split(':')[0]) * 60 + parseInt(existing.check_in.split(':')[1]);
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const status = (nowMinutes - checkInMinutes) < 240 ? 'Half-day' : 'Present';

  db.prepare('UPDATE attendance SET check_out = ?, status = ? WHERE id = ?').run(nowHM(), status, existing.id);
  const row = db.prepare('SELECT * FROM attendance WHERE id = ?').get(existing.id);
  res.json({ attendance: row });
});

// Own attendance (daily/weekly/monthly range)
router.get('/me', requireAuth, (req, res) => {
  const { from, to } = req.query;
  let rows;
  if (from && to) {
    rows = db.prepare('SELECT * FROM attendance WHERE user_id = ? AND date BETWEEN ? AND ? ORDER BY date DESC').all(req.user.id, from, to);
  } else {
    rows = db.prepare('SELECT * FROM attendance WHERE user_id = ? ORDER BY date DESC LIMIT 30').all(req.user.id);
  }
  res.json({ attendance: rows });
});

// Admin: view attendance of a specific employee, or everyone for a given date
router.get('/employee/:id', requireAuth, requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM attendance WHERE user_id = ? ORDER BY date DESC LIMIT 60').all(req.params.id);
  res.json({ attendance: rows });
});

router.get('/all', requireAuth, requireAdmin, (req, res) => {
  const date = req.query.date || todayISO();
  const rows = db.prepare(`
    SELECT a.*, u.name, u.employee_id, u.department FROM attendance a
    JOIN users u ON u.id = a.user_id
    WHERE a.date = ?
    ORDER BY u.name ASC
  `).all(date);
  res.json({ attendance: rows, date });
});

module.exports = router;
