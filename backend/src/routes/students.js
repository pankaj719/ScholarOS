const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../db/pool');
const { authRequired, requireRoles } = require('../middleware/auth');
const { asyncH } = require('../utils/helpers');
const router = express.Router();

router.get('/', authRequired, requireRoles('admin', 'teacher', 'staff'), asyncH(async (req, res) => {
  const { class_id, section_id, search } = req.query;
  const conds = [];
  const params = [];
  if (class_id) { params.push(class_id); conds.push(`s.class_id=$${params.length}`); }
  if (section_id) { params.push(section_id); conds.push(`s.section_id=$${params.length}`); }
  if (search) { params.push(`%${search}%`); conds.push(`(u.full_name ILIKE $${params.length} OR s.roll_number ILIKE $${params.length} OR u.email ILIKE $${params.length})`); }
  const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
  const r = await query(`
    SELECT s.id, s.user_id, s.roll_number, s.class_id, s.section_id, s.dob, s.gender, s.address,
           s.guardian_name, s.guardian_phone, s.guardian_email, s.admission_date, s.blood_group,
           u.email, u.full_name, u.phone, u.is_active,
           c.name AS class_name, sec.name AS section_name
    FROM students s
    JOIN users u ON u.id = s.user_id
    LEFT JOIN classes c ON c.id = s.class_id
    LEFT JOIN sections sec ON sec.id = s.section_id
    ${where}
    ORDER BY s.id DESC LIMIT 1000`, params);
  res.json(r.rows);
}));

router.get('/:id', authRequired, asyncH(async (req, res) => {
  const r = await query(`
    SELECT s.*, u.email, u.full_name, u.phone, u.is_active, c.name AS class_name, sec.name AS section_name
    FROM students s
    JOIN users u ON u.id = s.user_id
    LEFT JOIN classes c ON c.id = s.class_id
    LEFT JOIN sections sec ON sec.id = s.section_id
    WHERE s.id=$1`, [req.params.id]);
  if (!r.rows.length) return res.status(404).json({ error: 'Student not found' });
  const student = r.rows[0];
  if (req.user.role === 'student' && req.user.id !== student.user_id) return res.status(403).json({ error: 'Forbidden' });
  res.json(student);
}));

router.post('/', authRequired, requireRoles('admin', 'staff'), asyncH(async (req, res) => {
  const { email, password, full_name, phone, roll_number, class_id, section_id, dob, gender, address, guardian_name, guardian_phone, guardian_email, blood_group } = req.body;
  if (!email || !password || !full_name) return res.status(400).json({ error: 'Missing required fields' });
  const e = email.toLowerCase();
  const exists = await query('SELECT id FROM users WHERE email=$1', [e]);
  if (exists.rows.length) return res.status(409).json({ error: 'Email exists' });
  const hash = await bcrypt.hash(password, 10);
  const ur = await query('INSERT INTO users (email,password_hash,role,full_name,phone) VALUES ($1,$2,$3,$4,$5) RETURNING id', [e, hash, 'student', full_name, phone || null]);
  const uid = ur.rows[0].id;
  const roll = roll_number || ('STU' + String(uid).padStart(4, '0'));
  const sr = await query(`INSERT INTO students (user_id, roll_number, class_id, section_id, dob, gender, address, guardian_name, guardian_phone, guardian_email, blood_group)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
    [uid, roll, class_id || null, section_id || null, dob || null, gender || null, address || null, guardian_name || null, guardian_phone || null, guardian_email || null, blood_group || null]);
  res.status(201).json({ id: sr.rows[0].id, user_id: uid });
}));

router.put('/:id', authRequired, requireRoles('admin', 'staff', 'teacher', 'student'), asyncH(async (req, res) => {
  const sid = req.params.id;
  const owner = await query('SELECT user_id FROM students WHERE id=$1', [sid]);
  if (!owner.rows.length) return res.status(404).json({ error: 'Not found' });
  if (req.user.role === 'student' && req.user.id !== owner.rows[0].user_id) return res.status(403).json({ error: 'Forbidden' });
  if (req.user.role === 'teacher') return res.status(403).json({ error: 'Teachers cannot edit student records' });

  const { full_name, phone, class_id, section_id, dob, gender, address, guardian_name, guardian_phone, guardian_email, blood_group } = req.body;
  if (full_name || phone) {
    await query('UPDATE users SET full_name=COALESCE($1, full_name), phone=COALESCE($2, phone), updated_at=NOW() WHERE id=$3', [full_name, phone, owner.rows[0].user_id]);
  }
  await query(`UPDATE students SET
      class_id=COALESCE($1, class_id), section_id=COALESCE($2, section_id), dob=COALESCE($3, dob),
      gender=COALESCE($4, gender), address=COALESCE($5, address),
      guardian_name=COALESCE($6, guardian_name), guardian_phone=COALESCE($7, guardian_phone),
      guardian_email=COALESCE($8, guardian_email), blood_group=COALESCE($9, blood_group)
    WHERE id=$10`,
    [class_id, section_id, dob, gender, address, guardian_name, guardian_phone, guardian_email, blood_group, sid]);
  res.json({ ok: true });
}));

router.delete('/:id', authRequired, requireRoles('admin'), asyncH(async (req, res) => {
  const r = await query('SELECT user_id FROM students WHERE id=$1', [req.params.id]);
  if (!r.rows.length) return res.status(404).json({ error: 'Not found' });
  await query('DELETE FROM users WHERE id=$1', [r.rows[0].user_id]);
  res.json({ ok: true });
}));

module.exports = router;
