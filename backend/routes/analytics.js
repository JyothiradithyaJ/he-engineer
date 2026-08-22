const express = require('express');
const db = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/overview', requireAuth, requireAdmin, (req, res) => {
  const totalEmployees = db.prepare("SELECT COUNT(*) c FROM users WHERE role='employee'").get().c;

  const byDept = db.prepare(`SELECT department, COUNT(*) count FROM users GROUP BY department ORDER BY count DESC`).all();

  const today = new Date().toISOString().slice(0, 10);
  const presentToday = db.prepare(`SELECT COUNT(*) c FROM attendance WHERE date = ? AND status = 'Present'`).get(today).c;

  // Attendance trend, last 7 days
  const trend = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const present = db.prepare(`SELECT COUNT(*) c FROM attendance WHERE date=? AND status='Present'`).get(iso).c;
    const halfDay = db.prepare(`SELECT COUNT(*) c FROM attendance WHERE date=? AND status='Half-day'`).get(iso).c;
    const leave = db.prepare(`SELECT COUNT(*) c FROM attendance WHERE date=? AND status='Leave'`).get(iso).c;
    trend.push({ date: iso, present, halfDay, leave });
  }

  const leaveByStatus = db.prepare(`SELECT status, COUNT(*) count FROM leaves GROUP BY status`).all();
  const leaveByType = db.prepare(`SELECT leave_type, COUNT(*) count FROM leaves GROUP BY leave_type`).all();

  const pendingLeaves = db.prepare(`SELECT COUNT(*) c FROM leaves WHERE status='Pending'`).get().c;

  const payrollTotal = db.prepare(`SELECT COALESCE(SUM(net_pay),0) total FROM payslips WHERE month = strftime('%Y-%m','now')`).get().total;

  res.json({
    totalEmployees,
    presentToday,
    pendingLeaves,
    payrollTotalThisMonth: payrollTotal,
    byDepartment: byDept,
    attendanceTrend: trend,
    leaveByStatus,
    leaveByType,
  });
});

module.exports = router;
