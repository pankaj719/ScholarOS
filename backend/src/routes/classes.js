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

router.put('/subjects/:id', authRequired, requireRoles('admin'), asyncH(async (req, res) => {
  const { name, code } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Subject name required' });
  }

  const r = await query(
    'UPDATE subjects SET name=$1, code=$2 WHERE id=$3 RETURNING *',
    [name.trim(), code ? code.trim().toUpperCase() : null, req.params.id]
  );

  if (!r.rows.length) {
    return res.status(404).json({ error: 'Subject not found' });
  }

  res.json(r.rows[0]);
}));

router.delete('/subjects/:id', authRequired, requireRoles('admin'), asyncH(async (req, res) => {
  await query('DELETE FROM subjects WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
}));

router.get('/my-courses', authRequired, requireRoles('student'), asyncH(async (req, res) => {
  const r = await query(`
    SELECT
      c.id,
      c.name,
      c.academic_year,
      s.section_id,
      sec.name AS section_name,
      COALESCE(
        json_agg(
          DISTINCT jsonb_build_object(
            'id', sub.id,
            'name', sub.name,
            'code', sub.code
          )
        ) FILTER (WHERE sub.id IS NOT NULL),
        '[]'
      ) AS subjects
    FROM students s
    JOIN classes c ON c.id = s.class_id
    LEFT JOIN sections sec ON sec.id = s.section_id
    LEFT JOIN subjects sub ON sub.class_id = c.id
    WHERE s.user_id = $1
    GROUP BY c.id, s.section_id, sec.name
  `, [req.user.id]);

  res.json(r.rows);
}));


// Learning Content: Chapters
router.get('/subjects/:subjectId/chapters', authRequired, asyncH(async (req, res) => {
  const r = await query(`
    SELECT *
    FROM chapters
    WHERE subject_id=$1
      AND (is_published=true OR $2 IN ('admin','teacher'))
    ORDER BY display_order, id
  `, [req.params.subjectId, req.user.role]);

  res.json(r.rows);
}));

router.post('/subjects/:subjectId/chapters', authRequired, requireRoles('admin','teacher'), asyncH(async (req, res) => {
  const { title, description, display_order, is_published } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Chapter title required' });
  }

  const r = await query(`
    INSERT INTO chapters
      (subject_id, title, description, display_order, is_published)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *
  `, [
    req.params.subjectId,
    title,
    description || null,
    Number.isInteger(display_order) ? display_order : 0,
    is_published !== false
  ]);

  res.status(201).json(r.rows[0]);
}));

router.delete('/chapters/:id', authRequired, requireRoles('admin','teacher'), asyncH(async (req, res) => {
  await query('DELETE FROM chapters WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
}));


router.get('/lessons/:id', authRequired, asyncH(async (req, res) => {
  const r = await query(`
    SELECT
      l.*,
      c.title AS chapter_title,
      c.subject_id,
      s.name AS subject_name
    FROM lessons l
    JOIN chapters c ON c.id = l.chapter_id
    JOIN subjects s ON s.id = c.subject_id
    WHERE l.id=$1
      AND (l.is_published=true OR $2 IN ('admin','teacher'))
  `, [req.params.id, req.user.role]);

  if (!r.rows.length) {
    return res.status(404).json({ error: 'Lesson not found' });
  }

  res.json(r.rows[0]);
}));


router.put('/chapters/:id', authRequired, requireRoles('admin','teacher'), asyncH(async (req, res) => {
  const { title, description, display_order, is_published } = req.body;

  const r = await query(`
    UPDATE chapters
    SET
      title=COALESCE($1,title),
      description=$2,
      display_order=COALESCE($3,display_order),
      is_published=COALESCE($4,is_published),
      updated_at=NOW()
    WHERE id=$5
    RETURNING *
  `, [
    title || null,
    description ?? null,
    Number.isFinite(Number(display_order)) ? Number(display_order) : null,
    typeof is_published === 'boolean' ? is_published : null,
    req.params.id
  ]);

  if (!r.rows.length) {
    return res.status(404).json({ error: 'Chapter not found' });
  }

  res.json(r.rows[0]);
}));

router.put('/lessons/:id', authRequired, requireRoles('admin','teacher'), asyncH(async (req, res) => {
  const {
    title,
    description,
    video_url,
    notes_file_path,
    display_order,
    is_published
  } = req.body;

  const r = await query(`
    UPDATE lessons
    SET
      title=COALESCE($1,title),
      description=$2,
      video_url=$3,
      notes_file_path=$4,
      display_order=COALESCE($5,display_order),
      is_published=COALESCE($6,is_published),
      updated_at=NOW()
    WHERE id=$7
    RETURNING *
  `, [
    title || null,
    description ?? null,
    video_url ?? null,
    notes_file_path ?? null,
    Number.isFinite(Number(display_order)) ? Number(display_order) : null,
    typeof is_published === 'boolean' ? is_published : null,
    req.params.id
  ]);

  if (!r.rows.length) {
    return res.status(404).json({ error: 'Lesson not found' });
  }

  res.json(r.rows[0]);
}));

// Learning Content: Lessons
router.get('/chapters/:chapterId/lessons', authRequired, asyncH(async (req, res) => {
  const r = await query(`
    SELECT *
    FROM lessons
    WHERE chapter_id=$1
      AND (is_published=true OR $2 IN ('admin','teacher'))
    ORDER BY display_order, id
  `, [req.params.chapterId, req.user.role]);

  res.json(r.rows);
}));

router.post('/chapters/:chapterId/lessons', authRequired, requireRoles('admin','teacher'), asyncH(async (req, res) => {
  const {
    title,
    description,
    video_url,
    notes_file_path,
    display_order,
    is_published
  } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Lesson title required' });
  }

  const r = await query(`
    INSERT INTO lessons
      (chapter_id, title, description, video_url, notes_file_path, display_order, is_published)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *
  `, [
    req.params.chapterId,
    title,
    description || null,
    video_url || null,
    notes_file_path || null,
    Number.isInteger(display_order) ? display_order : 0,
    is_published !== false
  ]);

  res.status(201).json(r.rows[0]);
}));

router.delete('/lessons/:id', authRequired, requireRoles('admin','teacher'), asyncH(async (req, res) => {
  await query('DELETE FROM lessons WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
}));

module.exports = router;
