const express = require('express');
const { query } = require('../db/pool');
const { authRequired } = require('../middleware/auth');
const { asyncH } = require('../utils/helpers');
const router = express.Router();

router.get('/stats', authRequired, asyncH(async (req, res) => {
  const role = req.user.role;
  if (role === 'admin' || role === 'staff') {
    const [students, teachers, classes, todayAttendance, pendingFees, notices, assignments] = await Promise.all([
      query(`SELECT COUNT(*)::int AS n FROM students`),
      query(`SELECT COUNT(*)::int AS n FROM teachers`),
      query(`SELECT COUNT(*)::int AS n FROM classes`),
      query(`SELECT COUNT(*)::int AS n FROM attendance WHERE date=CURRENT_DATE`),
      query(`SELECT COUNT(*)::int AS n, COALESCE(SUM(due_amount),0)::numeric AS total FROM fees WHERE status<>'paid'`),
      query(`SELECT COUNT(*)::int AS n FROM notices`),
      query(`SELECT COUNT(*)::int AS n FROM assignments`),
    ]);
    // Attendance trend last 7 days
    const trend = await query(`
      SELECT date, COUNT(*) FILTER (WHERE status='present')::int AS present,
             COUNT(*) FILTER (WHERE status='absent')::int AS absent,
             COUNT(*) FILTER (WHERE status='late')::int AS late
      FROM attendance WHERE date >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY date ORDER BY date`);
    const recentNotices = await query(`SELECT id, title, priority, created_at FROM notices ORDER BY created_at DESC LIMIT 5`);
    res.json({
      total_students: students.rows[0].n,
      total_teachers: teachers.rows[0].n,
      total_classes: classes.rows[0].n,
      today_attendance: todayAttendance.rows[0].n,
      pending_fees_count: pendingFees.rows[0].n,
      pending_fees_total: pendingFees.rows[0].total,
      total_notices: notices.rows[0].n,
      total_assignments: assignments.rows[0].n,
      attendance_trend: trend.rows,
      recent_notices: recentNotices.rows,
    });
  } else if (role === 'teacher') {
    const [classes, students, assignments, notices] = await Promise.all([
      query(`SELECT COUNT(*)::int AS n FROM classes WHERE class_teacher_id=$1`, [req.user.id]),
      query(`SELECT COUNT(*)::int AS n FROM students s WHERE s.class_id IN (SELECT id FROM classes WHERE class_teacher_id=$1)`, [req.user.id]),
      query(`SELECT COUNT(*)::int AS n FROM assignments WHERE teacher_id=$1`, [req.user.id]),
      query(`SELECT COUNT(*)::int AS n FROM notices WHERE created_by=$1`, [req.user.id]),
    ]);
    res.json({
      my_classes: classes.rows[0].n,
      my_students: students.rows[0].n,
      my_assignments: assignments.rows[0].n,
      my_notices: notices.rows[0].n,
    });
  } else {
    // student
    const s = await query('SELECT id FROM students WHERE user_id=$1', [req.user.id]);
    if (!s.rows.length) return res.json({});
    const sid = s.rows[0].id;
    const [att, fees, marks, assign, notices] = await Promise.all([
      query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE status='present')::int AS present FROM attendance WHERE student_id=$1`, [sid]),
      query(`SELECT COALESCE(SUM(due_amount),0)::numeric AS due, COALESCE(SUM(paid_amount),0)::numeric AS paid FROM fees WHERE student_id=$1`, [sid]),
      query(`SELECT COUNT(*)::int AS n FROM marks m JOIN exams e ON e.id=m.exam_id WHERE m.student_id=$1 AND e.is_published=TRUE`, [sid]),
      query(`SELECT COUNT(*)::int AS n FROM assignments a JOIN students s2 ON s2.user_id=$1 WHERE a.class_id=s2.class_id`, [req.user.id]),
      query(`SELECT COUNT(*)::int AS n FROM notices`),
    ]);
    const total = att.rows[0].total;
    const present = att.rows[0].present;
    res.json({
      attendance_percentage: total ? Math.round((present / total) * 100) : 0,
      attendance_total: total,
      fees_due: fees.rows[0].due,
      fees_paid: fees.rows[0].paid,
      published_results: marks.rows[0].n,
      total_assignments: assign.rows[0].n,
      total_notices: notices.rows[0].n,
    });
  }
}));

module.exports = router;
