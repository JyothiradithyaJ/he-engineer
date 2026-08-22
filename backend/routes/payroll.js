const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

function computeNet({ basic, hra, allowances, deductions }) {
  return Math.round((basic + hra + allowances - deductions) * 100) / 100;
}

// Employee: own read-only payslips
router.get('/me', requireAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM payslips WHERE user_id = ? ORDER BY month DESC').all(req.user.id);
  const user = db.prepare('SELECT base_salary FROM users WHERE id = ?').get(req.user.id);
  res.json({ payslips: rows, baseSalary: user.base_salary });
});

// Admin: view payroll for an employee
router.get('/employee/:id', requireAuth, requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM payslips WHERE user_id = ? ORDER BY month DESC').all(req.params.id);
  res.json({ payslips: rows });
});

// Admin: generate/update a payslip for an employee & month (YYYY-MM)
router.post('/employee/:id', requireAuth, requireAdmin, (req, res) => {
  const { month, basic, hra = 0, allowances = 0, deductions = 0 } = req.body || {};
  if (!month || basic == null) return res.status(400).json({ error: 'Month and basic salary are required.' });

  const netPay = computeNet({ basic, hra, allowances, deductions });
  const existing = db.prepare('SELECT * FROM payslips WHERE user_id = ? AND month = ?').get(req.params.id, month);

  if (existing) {
    db.prepare('UPDATE payslips SET basic=?, hra=?, allowances=?, deductions=?, net_pay=? WHERE id=?')
      .run(basic, hra, allowances, deductions, netPay, existing.id);
  } else {
    db.prepare(`INSERT INTO payslips (id, user_id, month, basic, hra, allowances, deductions, net_pay)
      VALUES (?,?,?,?,?,?,?,?)`).run(uuidv4(), req.params.id, month, basic, hra, allowances, deductions, netPay);
  }

  db.prepare('INSERT INTO notifications (id, user_id, message) VALUES (?,?,?)')
    .run(uuidv4(), req.params.id, `Your payslip for ${month} is ready ($${netPay.toLocaleString()}).`);

  const row = db.prepare('SELECT * FROM payslips WHERE user_id = ? AND month = ?').get(req.params.id, month);
  res.status(201).json({ payslip: row });
});

// Admin: update base salary / structure
router.patch('/employee/:id/base-salary', requireAuth, requireAdmin, (req, res) => {
  const { baseSalary } = req.body || {};
  if (baseSalary == null || baseSalary < 0) return res.status(400).json({ error: 'A valid base salary is required.' });
  db.prepare('UPDATE users SET base_salary = ? WHERE id = ?').run(baseSalary, req.params.id);
  res.json({ ok: true, baseSalary });
});

module.exports = router;
