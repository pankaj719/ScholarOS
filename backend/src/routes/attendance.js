const express = require('express');
const { query } = require('../db/pool');
const { authRequired, requireRoles } = require('../middleware/auth');
const { asyncH } = require('../utils/helpers');
const router = express.Router();

// List attendance (admin/teacher/staff: filter by class/section/date; student: own only)
router.get('/', authRequired, asyncH(async (req, res) => {
  const { class_id, section_id, date, student_id, from, to } = req.query;
  const conds = [];
  const params = [];
  if (req.user.role === 'student') {
    const s = await query('SELECT id FROM students WHERE user_id=$1', [req.user.id]);
    if (!s.rows.length) return res.json([]);
    params.push(s.rows[0].id); conds.push(`a.student_id=$${params.length}`);
  } else if (student_id) {
    params.push(student_id); conds.push(`a.student_id=$${params.length}`);
  }
  if (class_id) { params.push(class_id); conds.push(`a.class_id=$${params.length}`); }
  if (section_id) { params.push(section_id); conds.push(`a.section_id=$${params.length}`); }
  if (date) { params.push(date); conds.push(`a.date=$${params.length}`); }
  if (from) { params.push(from); conds.push(`a.date>=$${params.length}`); }
  if (to) { params.push(to); conds.push(`a.date<=$${params.length}`); }
  const where = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
  const r = await query(`
    SELECT a.*, u.full_name AS student_name, s.roll_number
    FROM attendance a
    JOIN students s ON s.id = a.student_id
    JOIN users u ON u.id = s.user_id
    ${where}
    ORDER BY a.date DESC, s.roll_number LIMIT 2000`, params);
  res.json(r.rows);
}));

// Bulk mark attendance: { date, records: [{student_id, status, remarks}], class_id, section_id }
router.post('/mark', authRequired, requireRoles('admin', 'teacher', 'staff'), asyncH(async (req, res) => {
  const { date, records, class_id, section_id } = req.body;
  if (!date || !Array.isArray(records)) return res.status(400).json({ error: 'date and records[] required' });
  const results = [];
  for (const rec of records) {
    if (!rec.student_id || !rec.status) continue;
    const up = await query(`
      INSERT INTO attendance (student_id, class_id, section_id, date, status, remarks, marked_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (student_id, date)
      DO UPDATE SET status=EXCLUDED.status, remarks=EXCLUDED.remarks, marked_by=EXCLUDED.marked_by
      RETURNING *`, [rec.student_id, class_id || null, section_id || null, date, rec.status, rec.remarks || null, req.user.id]);
    results.push(up.rows[0]);
  }
  res.json({ count: results.length, records: results });
}));

// Attendance stats for a student
router.get('/stats/:student_id', authRequired, asyncH(async (req, res) => {
  const sid = req.params.student_id;
  if (req.user.role === 'student') {
    const s = await query('SELECT id FROM students WHERE user_id=$1', [req.user.id]);
    if (!s.rows.length || s.rows[0].id != sid) return res.status(403).json({ error: 'Forbidden' });
  }
  const r = await query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE status='present')::int AS present,
      COUNT(*) FILTER (WHERE status='absent')::int AS absent,
      COUNT(*) FILTER (WHERE status='late')::int AS late,
      COUNT(*) FILTER (WHERE status='leave')::int AS leave
    FROM attendance WHERE student_id=$1`, [sid]);
  const stat = r.rows[0];
  stat.percentage = stat.total ? Math.round(((stat.present + stat.late * 0.5) / stat.total) * 100) : 0;
  res.json(stat);
}));

module.exports = router;
