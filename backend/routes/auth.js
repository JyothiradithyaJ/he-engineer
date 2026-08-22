const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function publicUser(u) {
  const { password_hash, ...rest } = u;
  return rest;
}

function sign(user) {
  return jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

router.post('/signup', (req, res) => {
  const { employeeId, name, email, password, role, department, designation } = req.body || {};

  if (!employeeId || !name || !email || !password || !role) {
    return res.status(400).json({ error: 'Employee ID, name, email, password and role are all required.' });
  }
  if (!['admin', 'employee'].includes(role)) {
    return res.status(400).json({ error: 'Role must be either "employee" or "admin".' });
  }
  if (!PASSWORD_RULE.test(password)) {
    return res.status(400).json({ error: 'Password needs at least 8 characters, an uppercase letter, a lowercase letter, and a number.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ? OR employee_id = ?').get(email, employeeId);
  if (existing) {
    return res.status(409).json({ error: 'An account with that email or employee ID already exists.' });
  }

  const id = uuidv4();
  const password_hash = bcrypt.hashSync(password, 10);

  db.prepare(`INSERT INTO users (id, employee_id, name, email, password_hash, role, department, designation)
    VALUES (?,?,?,?,?,?,?,?)`)
    .run(id, employeeId, name, email, password_hash, role, department || 'General', designation || 'Team Member');

  db.prepare('INSERT INTO notifications (id, user_id, message) VALUES (?,?,?)')
    .run(uuidv4(), id, `Welcome to Dayflow, ${name.split(' ')[0]}! Your account is ready.`);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  const token = sign(user);
  res.status(201).json({ token, user: publicUser(user) });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  const token = sign(user);
  res.json({ token, user: publicUser(user) });
});

router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user: publicUser(user) });
});

module.exports = router;
