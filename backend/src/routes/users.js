const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../db/pool');
const { authRequired, requireRoles } = require('../middleware/auth');
const { asyncH, buildSearch } = require('../utils/helpers');
const router = express.Router();

router.get('/', authRequired, requireRoles('admin', 'staff'), asyncH(async (req, res) => {
  const { role } = req.query;
  const s = buildSearch(req, ['full_name', 'email', 'phone']);
  const conds = [];
  const params = [];
  if (role) { params.push(role); conds.push(`role=$${params.length}`); }
  if (s.clause) { params.push(...s.params); conds.push(s.clause.replace(/\$\d+/g, (m) => `$${params.length - (s.params.length - 1) + parseInt(m.slice(1)) - 1}`)); }
  const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
  const r = await query(`SELECT id,email,role,full_name,phone,is_active,created_at FROM users ${where} ORDER BY id DESC LIMIT 500`, params);
  res.json(r.rows);
}));

router.post('/', authRequired, requireRoles('admin'), asyncH(async (req, res) => {
  const { email, password, role, full_name, phone, employee_id, qualification, specialization, salary } = req.body;
  if (!email || !password || !role || !full_name) return res.status(400).json({ error: 'Missing required fields' });
  if (!['admin', 'teacher', 'staff'].includes(role)) return res.status(400).json({ error: 'Invalid role (use student registration endpoint)' });
  const e = email.toLowerCase();
  const exists = await query('SELECT id FROM users WHERE email=$1', [e]);
  if (exists.rows.length) return res.status(409).json({ error: 'Email exists' });
  const hash = await bcrypt.hash(password, 10);
  const r = await query('INSERT INTO users (email,password_hash,role,full_name,phone) VALUES ($1,$2,$3,$4,$5) RETURNING id,email,role,full_name', [e, hash, role, full_name, phone || null]);
  if (role === 'teacher') {
    await query('INSERT INTO teachers (user_id, employee_id, qualification, specialization, salary) VALUES ($1,$2,$3,$4,$5)',
      [r.rows[0].id, employee_id || ('EMP' + String(r.rows[0].id).padStart(4, '0')), qualification || null, specialization || null, salary || null]);
  }
  res.status(201).json(r.rows[0]);
}));

router.put('/:id', authRequired, requireRoles('admin'), asyncH(async (req, res) => {
  const { full_name, phone, is_active, password } = req.body;
  if (password) {
    const hash = await bcrypt.hash(password, 10);
    await query('UPDATE users SET password_hash=$1 WHERE id=$2', [hash, req.params.id]);
  }
  await query('UPDATE users SET full_name=COALESCE($1, full_name), phone=COALESCE($2, phone), is_active=COALESCE($3, is_active), updated_at=NOW() WHERE id=$4',
    [full_name, phone, is_active, req.params.id]);
  res.json({ ok: true });
}));

router.delete('/:id', authRequired, requireRoles('admin'), asyncH(async (req, res) => {
  await query('DELETE FROM users WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
}));

module.exports = router;
