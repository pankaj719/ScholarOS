const express = require('express');
const { query } = require('../db/pool');
const { authRequired, requireRoles } = require('../middleware/auth');
const { asyncH } = require('../utils/helpers');
const router = express.Router();

router.get('/', authRequired, asyncH(async (req, res) => {
  const { student_id, status } = req.query;
  const conds = [];
  const params = [];
  if (req.user.role === 'student') {
    const s = await query('SELECT id FROM students WHERE user_id=$1', [req.user.id]);
    if (!s.rows.length) return res.json([]);
    params.push(s.rows[0].id); conds.push(`f.student_id=$${params.length}`);
  } else if (student_id) { params.push(student_id); conds.push(`f.student_id=$${params.length}`); }
  if (status) { params.push(status); conds.push(`f.status=$${params.length}`); }
  const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
  const r = await query(`
    SELECT f.*, u.full_name AS student_name, s.roll_number, c.name AS class_name
    FROM fees f
    JOIN students s ON s.id=f.student_id
    JOIN users u ON u.id=s.user_id
    LEFT JOIN classes c ON c.id=s.class_id
    ${where}
    ORDER BY f.created_at DESC LIMIT 1000`, params);
  res.json(r.rows);
}));

router.post('/', authRequired, requireRoles('admin', 'staff'), asyncH(async (req, res) => {
  const { student_id, total_amount, paid_amount, academic_year, description } = req.body;
  const due = (parseFloat(total_amount) - parseFloat(paid_amount || 0));
  const status = due <= 0 ? 'paid' : (paid_amount > 0 ? 'partial' : 'pending');
  const r = await query(`INSERT INTO fees (student_id, total_amount, paid_amount, due_amount, status, academic_year, description)
    VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [student_id, total_amount, paid_amount || 0, due, status, academic_year || null, description || null]);
  res.status(201).json(r.rows[0]);
}));

router.post('/:id/pay', authRequired, requireRoles('admin', 'staff'), asyncH(async (req, res) => {
  const { amount } = req.body;
  const cur = await query('SELECT * FROM fees WHERE id=$1', [req.params.id]);
  if (!cur.rows.length) return res.status(404).json({ error: 'Not found' });
  const f = cur.rows[0];
  const newPaid = parseFloat(f.paid_amount) + parseFloat(amount);
  const newDue = parseFloat(f.total_amount) - newPaid;
  const status = newDue <= 0 ? 'paid' : 'partial';
  const receipt = 'RCP-' + Date.now();
  const r = await query(`UPDATE fees SET paid_amount=$1, due_amount=$2, status=$3, payment_date=CURRENT_DATE, receipt_number=$4 WHERE id=$5 RETURNING *`,
    [newPaid, Math.max(0, newDue), status, receipt, req.params.id]);
  res.json(r.rows[0]);
}));

router.delete('/:id', authRequired, requireRoles('admin'), asyncH(async (req, res) => {
  await query('DELETE FROM fees WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
}));

module.exports = router;
