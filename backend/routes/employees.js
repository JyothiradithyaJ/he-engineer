const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

function publicUser(u) {
  const { password_hash, ...rest } = u;
  return rest;
}

// List all employees (admin only) - supports ?search= & ?department=
router.get('/', requireAuth, requireAdmin, (req, res) => {
  const { search = '', department = '' } = req.query;
  let rows = db.prepare('SELECT * FROM users ORDER BY name ASC').all();
  if (search) {
    const s = search.toLowerCase();
    rows = rows.filter(u => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.employee_id.toLowerCase().includes(s));
  }
  if (department) rows = rows.filter(u => u.department === department);
  res.json({ employees: rows.map(publicUser) });
});

router.get('/departments', requireAuth, requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT DISTINCT department FROM users ORDER BY department').all();
  res.json({ departments: rows.map(r => r.department) });
});

// Get a single employee (self, or admin viewing anyone)
router.get('/:id', requireAuth, (req, res) => {
  if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
    return res.status(403).json({ error: 'You can only view your own profile.' });
  }
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Employee not found.' });
  res.json({ user: publicUser(user) });
});

// Edit profile - employees may only edit limited fields; admin may edit any field on any user
router.patch('/:id', requireAuth, (req, res) => {
  const isSelf = req.user.id === req.params.id;
  const isAdmin = req.user.role === 'admin';
  if (!isSelf && !isAdmin) return res.status(403).json({ error: 'You are not allowed to edit this profile.' });

  const target = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!target) return res.status(404).json({ error: 'Employee not found.' });

  const allowedSelfFields = ['phone', 'address', 'profile_pic'];
  const allowedAdminFields = ['name', 'phone', 'address', 'profile_pic', 'department', 'designation', 'base_salary', 'role'];
  const allowed = isAdmin ? allowedAdminFields : allowedSelfFields;

  const updates = {};
  for (const key of allowed) {
    if (key in req.body) updates[key] = req.body[key];
  }
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No editable fields were provided.' });
  }

  const setClause = Object.keys(updates).map(k => `${k} = @${k}`).join(', ');
  db.prepare(`UPDATE users SET ${setClause} WHERE id = @id`).run({ ...updates, id: req.params.id });

  const updated = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  res.json({ user: publicUser(updated) });
});

// Notifications
router.get('/:id/notifications', requireAuth, (req, res) => {
  if (req.user.id !== req.params.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not allowed.' });
  }
  const rows = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30').all(req.params.id);
  res.json({ notifications: rows });
});

router.post('/:id/notifications/read-all', requireAuth, (req, res) => {
  if (req.user.id !== req.params.id) return res.status(403).json({ error: 'Not allowed.' });
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
