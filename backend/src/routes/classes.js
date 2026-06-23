const express = require('express');
const { query } = require('../db/pool');
const { authRequired, requireRoles } = require('../middleware/auth');
const { asyncH } = require('../utils/helpers');
const router = express.Router();

router.get('/', authRequired, asyncH(async (req, res) => {
  const r = await query(`
    SELECT c.*, u.full_name AS class_teacher_name,
      (SELECT COUNT(*) FROM students s WHERE s.class_id=c.id)::int AS student_count,
      COALESCE(json_agg(DISTINCT jsonb_build_object('id', sec.id, 'name', sec.name)) FILTER (WHERE sec.id IS NOT NULL), '[]') AS sections
    FROM classes c
    LEFT JOIN users u ON u.id = c.class_teacher_id
    LEFT JOIN sections sec ON sec.class_id = c.id
    GROUP BY c.id, u.full_name
    ORDER BY c.id`);
  res.json(r.rows);
}));

router.post('/', authRequired, requireRoles('admin'), asyncH(async (req, res) => {
  const { name, academic_year, class_teacher_id } = req.body;
  if (!name || !academic_year) return res.status(400).json({ error: 'Name and academic year required' });
  const r = await query('INSERT INTO classes (name, academic_year, class_teacher_id) VALUES ($1,$2,$3) RETURNING *', [name, academic_year, class_teacher_id || null]);
  res.status(201).json(r.rows[0]);
}));

router.put('/:id', authRequired, requireRoles('admin'), asyncH(async (req, res) => {
  const { name, academic_year, class_teacher_id } = req.body;
  await query('UPDATE classes SET name=COALESCE($1, name), academic_year=COALESCE($2, academic_year), class_teacher_id=COALESCE($3, class_teacher_id) WHERE id=$4',
    [name, academic_year, class_teacher_id, req.params.id]);
  res.json({ ok: true });
}));

router.delete('/:id', authRequired, requireRoles('admin'), asyncH(async (req, res) => {
  await query('DELETE FROM classes WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
}));

router.post('/:id/sections', authRequired, requireRoles('admin'), asyncH(async (req, res) => {
  const { name } = req.body;
  const r = await query('INSERT INTO sections (class_id, name) VALUES ($1,$2) RETURNING *', [req.params.id, name]);
  res.status(201).json(r.rows[0]);
}));

router.delete('/sections/:id', authRequired, requireRoles('admin'), asyncH(async (req, res) => {
  await query('DELETE FROM sections WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
}));

router.get('/:id/subjects', authRequired, asyncH(async (req, res) => {
  const r = await query('SELECT * FROM subjects WHERE class_id=$1 ORDER BY name', [req.params.id]);
  res.json(r.rows);
}));

router.post('/:id/subjects', authRequired, requireRoles('admin'), asyncH(async (req, res) => {
  const { name, code } = req.body;
  const r = await query('INSERT INTO subjects (name, code, class_id) VALUES ($1,$2,$3) RETURNING *', [name, code || null, req.params.id]);
  res.status(201).json(r.rows[0]);
}));

router.delete('/subjects/:id', authRequired, requireRoles('admin'), asyncH(async (req, res) => {
  await query('DELETE FROM subjects WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
}));

module.exports = router;
