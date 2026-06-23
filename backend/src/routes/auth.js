const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { query } = require('../db/pool');
const { authRequired } = require('../middleware/auth');
const { asyncH } = require('../utils/helpers');

const router = express.Router();

function makeToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.full_name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

router.post('/login',
  body('email').isEmail(),
  body('password').isLength({ min: 4 }),
  asyncH(async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ error: 'Invalid input', details: errs.array() });
    const { email, password } = req.body;
    const r = await query('SELECT * FROM users WHERE email=$1 AND is_active=TRUE', [email.toLowerCase()]);
    if (!r.rows.length) return res.status(401).json({ error: 'Invalid credentials' });
    const u = r.rows[0];
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = makeToken(u);
    res.json({ token, user: { id: u.id, email: u.email, role: u.role, name: u.full_name } });
  })
);

// Student self registration
router.post('/register',
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('full_name').isLength({ min: 2 }),
  asyncH(async (req, res) => {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ error: 'Invalid input', details: errs.array() });
    const { email, password, full_name, phone, roll_number, dob, gender, address, guardian_name, guardian_phone, guardian_email } = req.body;

    const exists = await query('SELECT id FROM users WHERE email=$1', [email.toLowerCase()]);
    if (exists.rows.length) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 10);
    const ur = await query(
      'INSERT INTO users (email,password_hash,role,full_name,phone) VALUES ($1,$2,$3,$4,$5) RETURNING id',
      [email.toLowerCase(), hash, 'student', full_name, phone || null]
    );
    const uid = ur.rows[0].id;

    const roll = roll_number || ('STU' + String(uid).padStart(4, '0'));
    await query(
      'INSERT INTO students (user_id, roll_number, dob, gender, address, guardian_name, guardian_phone, guardian_email) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
      [uid, roll, dob || null, gender || null, address || null, guardian_name || null, guardian_phone || null, guardian_email || null]
    );

    const u = (await query('SELECT * FROM users WHERE id=$1', [uid])).rows[0];
    const token = makeToken(u);
    res.status(201).json({ token, user: { id: u.id, email: u.email, role: u.role, name: u.full_name } });
  })
);

router.get('/me', authRequired, asyncH(async (req, res) => {
  const r = await query('SELECT id,email,role,full_name,phone FROM users WHERE id=$1', [req.user.id]);
  if (!r.rows.length) return res.status(404).json({ error: 'User not found' });
  const u = r.rows[0];
  let extra = {};
  if (u.role === 'student') {
    const s = await query(`SELECT s.*, c.name AS class_name, sec.name AS section_name
      FROM students s
      LEFT JOIN classes c ON c.id = s.class_id
      LEFT JOIN sections sec ON sec.id = s.section_id
      WHERE s.user_id=$1`, [u.id]);
    extra = { student: s.rows[0] || null };
  } else if (u.role === 'teacher') {
    const t = await query('SELECT * FROM teachers WHERE user_id=$1', [u.id]);
    extra = { teacher: t.rows[0] || null };
  }
  res.json({ user: u, ...extra });
}));

router.put('/me', authRequired, asyncH(async (req, res) => {
  const { full_name, phone } = req.body;
  await query('UPDATE users SET full_name=COALESCE($1, full_name), phone=COALESCE($2, phone), updated_at=NOW() WHERE id=$3', [full_name, phone, req.user.id]);
  res.json({ ok: true });
}));

router.post('/change-password', authRequired, asyncH(async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!new_password || new_password.length < 6) return res.status(400).json({ error: 'Password too short' });
  const r = await query('SELECT password_hash FROM users WHERE id=$1', [req.user.id]);
  const ok = await bcrypt.compare(current_password || '', r.rows[0].password_hash);
  if (!ok) return res.status(401).json({ error: 'Current password incorrect' });
  const hash = await bcrypt.hash(new_password, 10);
  await query('UPDATE users SET password_hash=$1, updated_at=NOW() WHERE id=$2', [hash, req.user.id]);
  res.json({ ok: true });
}));

module.exports = router;
