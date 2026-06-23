const express = require('express');
const { query } = require('../db/pool');
const { authRequired, requireRoles } = require('../middleware/auth');
const { asyncH } = require('../utils/helpers');
const router = express.Router();

// Exams
router.get('/exams', authRequired, asyncH(async (req, res) => {
  const { class_id } = req.query;
  const conds = [];
  const params = [];
  if (class_id) { params.push(class_id); conds.push(`e.class_id=$${params.length}`); }
  if (req.user.role === 'student') conds.push(`e.is_published=TRUE`);
  const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
  const r = await query(`SELECT e.*, c.name AS class_name FROM exams e LEFT JOIN classes c ON c.id=e.class_id ${where} ORDER BY exam_date DESC`, params);
  res.json(r.rows);
}));

router.post('/exams', authRequired, requireRoles('admin', 'teacher'), asyncH(async (req, res) => {
  const { name, class_id, exam_date, total_marks, academic_year } = req.body;
  const r = await query('INSERT INTO exams (name, class_id, exam_date, total_marks, academic_year) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [name, class_id, exam_date, total_marks || 100, academic_year]);
  res.status(201).json(r.rows[0]);
}));

router.put('/exams/:id', authRequired, requireRoles('admin', 'teacher'), asyncH(async (req, res) => {
  const { name, exam_date, total_marks, is_published } = req.body;
  await query('UPDATE exams SET name=COALESCE($1, name), exam_date=COALESCE($2, exam_date), total_marks=COALESCE($3, total_marks), is_published=COALESCE($4, is_published) WHERE id=$5',
    [name, exam_date, total_marks, is_published, req.params.id]);
  res.json({ ok: true });
}));

router.delete('/exams/:id', authRequired, requireRoles('admin'), asyncH(async (req, res) => {
  await query('DELETE FROM exams WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
}));

// Marks
router.get('/', authRequired, asyncH(async (req, res) => {
  const { exam_id, student_id } = req.query;
  const conds = [];
  const params = [];
  if (req.user.role === 'student') {
    const s = await query('SELECT id FROM students WHERE user_id=$1', [req.user.id]);
    if (!s.rows.length) return res.json([]);
    params.push(s.rows[0].id); conds.push(`m.student_id=$${params.length}`);
    conds.push(`e.is_published=TRUE`);
  } else if (student_id) { params.push(student_id); conds.push(`m.student_id=$${params.length}`); }
  if (exam_id) { params.push(exam_id); conds.push(`m.exam_id=$${params.length}`); }
  const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
  const r = await query(`
    SELECT m.*, e.name AS exam_name, e.total_marks, e.is_published, sub.name AS subject_name, u.full_name AS student_name, s.roll_number
    FROM marks m
    JOIN exams e ON e.id=m.exam_id
    JOIN subjects sub ON sub.id=m.subject_id
    JOIN students s ON s.id=m.student_id
    JOIN users u ON u.id=s.user_id
    ${where}
    ORDER BY e.exam_date DESC, sub.name`, params);
  res.json(r.rows);
}));

router.post('/', authRequired, requireRoles('admin', 'teacher'), asyncH(async (req, res) => {
  const { student_id, exam_id, subject_id, marks_obtained, grade, remarks } = req.body;
  const r = await query(`
    INSERT INTO marks (student_id, exam_id, subject_id, marks_obtained, grade, remarks)
    VALUES ($1,$2,$3,$4,$5,$6)
    ON CONFLICT (student_id, exam_id, subject_id)
    DO UPDATE SET marks_obtained=EXCLUDED.marks_obtained, grade=EXCLUDED.grade, remarks=EXCLUDED.remarks
    RETURNING *`, [student_id, exam_id, subject_id, marks_obtained, grade || null, remarks || null]);
  res.status(201).json(r.rows[0]);
}));

router.delete('/:id', authRequired, requireRoles('admin', 'teacher'), asyncH(async (req, res) => {
  await query('DELETE FROM marks WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
}));

module.exports = router;
