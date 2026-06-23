const express = require('express');
const { query } = require('../db/pool');
const { authRequired, requireRoles } = require('../middleware/auth');
const { asyncH } = require('../utils/helpers');
const router = express.Router();

router.get('/', authRequired, asyncH(async (req, res) => {
  let { class_id, section_id } = req.query;
  if (req.user.role === 'student') {
    const s = await query('SELECT class_id, section_id FROM students WHERE user_id=$1', [req.user.id]);
    if (s.rows.length) { class_id = s.rows[0].class_id; section_id = s.rows[0].section_id; }
  }
  const conds = [];
  const params = [];
  if (class_id) { params.push(class_id); conds.push(`t.class_id=$${params.length}`); }
  if (section_id) { params.push(section_id); conds.push(`t.section_id=$${params.length}`); }
  const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
  const r = await query(`
    SELECT t.*, sub.name AS subject_name, u.full_name AS teacher_name, c.name AS class_name, sec.name AS section_name
    FROM timetable t
    LEFT JOIN subjects sub ON sub.id=t.subject_id
    LEFT JOIN users u ON u.id=t.teacher_id
    LEFT JOIN classes c ON c.id=t.class_id
    LEFT JOIN sections sec ON sec.id=t.section_id
    ${where}
    ORDER BY CASE t.day_of_week WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3 WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6 ELSE 7 END, t.period`, params);
  res.json(r.rows);
}));

router.post('/', authRequired, requireRoles('admin', 'teacher'), asyncH(async (req, res) => {
  const { class_id, section_id, day_of_week, period, subject_id, teacher_id, start_time, end_time, room } = req.body;
  const r = await query(`INSERT INTO timetable (class_id, section_id, day_of_week, period, subject_id, teacher_id, start_time, end_time, room) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [class_id, section_id || null, day_of_week, period, subject_id || null, teacher_id || null, start_time || null, end_time || null, room || null]);
  res.status(201).json(r.rows[0]);
}));

router.put('/:id', authRequired, requireRoles('admin', 'teacher'), asyncH(async (req, res) => {
  const { subject_id, teacher_id, start_time, end_time, room } = req.body;
  await query('UPDATE timetable SET subject_id=COALESCE($1, subject_id), teacher_id=COALESCE($2, teacher_id), start_time=COALESCE($3, start_time), end_time=COALESCE($4, end_time), room=COALESCE($5, room) WHERE id=$6',
    [subject_id, teacher_id, start_time, end_time, room, req.params.id]);
  res.json({ ok: true });
}));

router.delete('/:id', authRequired, requireRoles('admin', 'teacher'), asyncH(async (req, res) => {
  await query('DELETE FROM timetable WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
}));

module.exports = router;
