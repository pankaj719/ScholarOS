require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./pool');

async function getOrCreateUser(email, password, role, fullName, phone) {
  const found = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
  if (found.rows.length) return found.rows[0].id;
  const hash = await bcrypt.hash(password, 10);
  const ins = await pool.query(
    'INSERT INTO users (email,password_hash,role,full_name,phone) VALUES ($1,$2,$3,$4,$5) RETURNING id',
    [email, hash, role, fullName, phone]
  );
  return ins.rows[0].id;
}

(async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@h_m.local';
    const adminPass = process.env.ADMIN_PASSWORD || 'Admin@12345';
    const adminName = process.env.ADMIN_NAME || 'System Administrator';

    const adminId = await getOrCreateUser(adminEmail, adminPass, 'admin', adminName, '+10000000001');
    console.log(`Admin ready: ${adminEmail} / ${adminPass}`);

    const staffId = await getOrCreateUser('staff@h_m.local', 'Staff@12345', 'staff', 'Office Staff', '+10000000002');

    const teacher1Uid = await getOrCreateUser('teacher@h_m.local', 'Teacher@12345', 'teacher', 'John Anderson', '+10000000003');
    const teacher2Uid = await getOrCreateUser('mary.teacher@h_m.local', 'Teacher@12345', 'teacher', 'Mary Johnson', '+10000000004');

    // Teacher records
    for (const [uid, eid, q, sp] of [
      [teacher1Uid, 'EMP001', 'M.Sc Mathematics', 'Mathematics'],
      [teacher2Uid, 'EMP002', 'M.A English', 'English & Literature'],
    ]) {
      await pool.query(
        `INSERT INTO teachers (user_id, employee_id, qualification, specialization, salary)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT (user_id) DO NOTHING`,
        [uid, eid, q, sp, 50000]
      );
    }

    // Classes
    const year = '2025-2026';
    const classes = ['Class 9', 'Class 10', 'Class 11', 'Class 12'];
    const classIds = {};
    for (const c of classes) {
      const r = await pool.query(
        `INSERT INTO classes (name, academic_year, class_teacher_id)
         VALUES ($1,$2,$3) ON CONFLICT (name, academic_year) DO UPDATE SET name=EXCLUDED.name
         RETURNING id`,
        [c, year, teacher1Uid]
      );
      classIds[c] = r.rows[0].id;
    }

    // Sections
    const sectionIds = {};
    for (const c of classes) {
      for (const s of ['A', 'B']) {
        const r = await pool.query(
          `INSERT INTO sections (class_id, name) VALUES ($1,$2)
           ON CONFLICT (class_id, name) DO UPDATE SET name=EXCLUDED.name
           RETURNING id`,
          [classIds[c], s]
        );
        sectionIds[`${c}-${s}`] = r.rows[0].id;
      }
    }

    // Subjects
    const subjectsByClass = ['Mathematics', 'English', 'Science', 'Social Studies', 'Computer Science'];
    const subjectIds = {};
    for (const c of classes) {
      subjectIds[c] = {};
      for (const sub of subjectsByClass) {
        const exists = await pool.query(
          'SELECT id FROM subjects WHERE name=$1 AND class_id=$2',
          [sub, classIds[c]]
        );
        if (exists.rows.length) {
          subjectIds[c][sub] = exists.rows[0].id;
        } else {
          const r = await pool.query(
            'INSERT INTO subjects (name, code, class_id) VALUES ($1,$2,$3) RETURNING id',
            [sub, sub.substring(0, 3).toUpperCase(), classIds[c]]
          );
          subjectIds[c][sub] = r.rows[0].id;
        }
      }
    }

    // Students
    const studentSeeds = [
      ['alice@h_m.local', 'Alice Smith', 'STU001', 'Class 10', 'A', 'F'],
      ['bob@h_m.local', 'Bob Wilson', 'STU002', 'Class 10', 'A', 'M'],
      ['charlie@h_m.local', 'Charlie Brown', 'STU003', 'Class 10', 'B', 'M'],
      ['diana@h_m.local', 'Diana Prince', 'STU004', 'Class 11', 'A', 'F'],
      ['evan@h_m.local', 'Evan Davis', 'STU005', 'Class 9', 'A', 'M'],
    ];

    for (const [email, name, roll, cls, sec, gender] of studentSeeds) {
      const uid = await getOrCreateUser(email, 'Student@12345', 'student', name, '+1' + Math.floor(Math.random() * 1e10));
      await pool.query(
        `INSERT INTO students (user_id, roll_number, class_id, section_id, gender, address, guardian_name, guardian_phone, dob)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (user_id) DO NOTHING`,
        [uid, roll, classIds[cls], sectionIds[`${cls}-${sec}`], gender, '123 School St', `${name}'s Parent`, '+11111111111', '2008-01-15']
      );

      const sid = (await pool.query('SELECT id FROM students WHERE user_id=$1', [uid])).rows[0].id;
      // Fee record
      await pool.query(
        `INSERT INTO fees (student_id, total_amount, paid_amount, due_amount, status, academic_year, description)
         SELECT $1::int,$2::numeric,$3::numeric,$4::numeric,$5::varchar,$6::varchar,$7::text
         WHERE NOT EXISTS (SELECT 1 FROM fees WHERE student_id=$1 AND academic_year=$6)`,
        [sid, 5000, 3000, 2000, 'partial', year, 'Annual Tuition Fee']
      );
    }

    // Sample notice
    await pool.query(
      `INSERT INTO notices (title, description, priority, target_role, created_by)
       SELECT 'Welcome to the new academic year','School reopens on Monday. All students must be present in uniform.','high','all',$1
       WHERE NOT EXISTS (SELECT 1 FROM notices WHERE title='Welcome to the new academic year')`,
      [adminId]
    );

    // Sample exam
    const examRes = await pool.query(
      `INSERT INTO exams (name, class_id, exam_date, total_marks, academic_year, is_published)
       SELECT 'Mid Term Exam', $1, CURRENT_DATE + 30, 100, $2, FALSE
       WHERE NOT EXISTS (SELECT 1 FROM exams WHERE name='Mid Term Exam' AND class_id=$1)
       RETURNING id`,
      [classIds['Class 10'], year]
    );

    // Timetable for Class 10 A
    const c10aId = classIds['Class 10'];
    const c10aSec = sectionIds['Class 10-A'];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const periods = [
      [1, '09:00', '09:45', 'Mathematics'],
      [2, '09:45', '10:30', 'English'],
      [3, '10:45', '11:30', 'Science'],
      [4, '11:30', '12:15', 'Social Studies'],
      [5, '13:00', '13:45', 'Computer Science'],
    ];
    for (const d of days) {
      for (const [p, st, et, sub] of periods) {
        const exists = await pool.query(
          `SELECT id FROM timetable WHERE class_id=$1 AND section_id=$2 AND day_of_week=$3 AND period=$4`,
          [c10aId, c10aSec, d, p]
        );
        if (!exists.rows.length) {
          await pool.query(
            `INSERT INTO timetable (class_id, section_id, day_of_week, period, subject_id, teacher_id, start_time, end_time, room)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
            [c10aId, c10aSec, d, p, subjectIds['Class 10'][sub], teacher1Uid, st, et, 'Room 101']
          );
        }
      }
    }

    console.log('Seeding completed.');
    process.exit(0);
  } catch (e) {
    console.error('Seed failed:', e);
    process.exit(1);
  }
})();
