const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply for leave
router.post('/', requireAuth, (req, res) => {
  const { leaveType, startDate, endDate, remarks } = req.body || {};
  if (!leaveType || !startDate || !endDate) {
    return res.status(400).json({ error: 'Leave type, start date and end date are required.' });
  }
  if (!['Paid', 'Sick', 'Unpaid'].includes(leaveType)) {
    return res.status(400).json({ error: 'Leave type must be Paid, Sick, or Unpaid.' });
  }
  if (new Date(endDate) < new Date(startDate)) {
    return res.status(400).json({ error: 'End date cannot be before the start date.' });
  }

  const id = uuidv4();
  db.prepare(`INSERT INTO leaves (id, user_id, leave_type, start_date, end_date, remarks)
    VALUES (?,?,?,?,?,?)`).run(id, req.user.id, leaveType, startDate, endDate, remarks || '');

  const admins = db.prepare("SELECT id FROM users WHERE role = 'admin'").all();
  for (const a of admins) {
    db.prepare('INSERT INTO notifications (id, user_id, message) VALUES (?,?,?)')
      .run(uuidv4(), a.id, `${req.user.name} requested ${leaveType} leave (${startDate} to ${endDate}).`);
  }

  const row = db.prepare('SELECT * FROM leaves WHERE id = ?').get(id);
  res.status(201).json({ leave: row });
});

// Own leave history
router.get('/me', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM leaves WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json({ leaves: rows });
});

// Admin: all leave requests (optionally filter by status)
router.get('/', requireAuth, requireAdmin, (req, res) => {
  const { status } = req.query;
  let rows;
  if (status) {
    rows = db.prepare(`SELECT l.*, u.name, u.employee_id, u.department FROM leaves l
      JOIN users u ON u.id = l.user_id WHERE l.status = ? ORDER BY l.created_at DESC`).all(status);
  } else {
    rows = db.prepare(`SELECT l.*, u.name, u.employee_id, u.department FROM leaves l
      JOIN users u ON u.id = l.user_id ORDER BY l.created_at DESC`).all();
  }
  res.json({ leaves: rows });
});

// Admin: approve / reject
router.patch('/:id', requireAuth, requireAdmin, (req, res) => {
  const { status, adminComment } = req.body || {};
  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be Approved or Rejected.' });
  }
  const leave = db.prepare('SELECT * FROM leaves WHERE id = ?').get(req.params.id);
  if (!leave) return res.status(404).json({ error: 'Leave request not found.' });

  db.prepare('UPDATE leaves SET status = ?, admin_comment = ? WHERE id = ?').run(status, adminComment || '', req.params.id);

  db.prepare('INSERT INTO notifications (id, user_id, message) VALUES (?,?,?)')
    .run(uuidv4(), leave.user_id, `Your ${leave.leave_type} leave request (${leave.start_date} to ${leave.end_date}) was ${status.toLowerCase()}.`);

  // If approved, mark attendance days as "Leave"
  if (status === 'Approved') {
    let d = new Date(leave.start_date);
    const end = new Date(leave.end_date);
    while (d <= end) {
      const iso = d.toISOString().slice(0, 10);
      const existing = db.prepare('SELECT * FROM attendance WHERE user_id = ? AND date = ?').get(leave.user_id, iso);
      if (existing) {
        db.prepare('UPDATE attendance SET status = ? WHERE id = ?').run('Leave', existing.id);
      } else {
        db.prepare('INSERT INTO attendance (id, user_id, date, status) VALUES (?,?,?,?)')
          .run(uuidv4(), leave.user_id, iso, 'Leave');
      }
      d.setDate(d.getDate() + 1);
    }
  }

  const updated = db.prepare('SELECT * FROM leaves WHERE id = ?').get(req.params.id);
  res.json({ leave: updated });
});

module.exports = router;
