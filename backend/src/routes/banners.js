const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../db/pool');
const { authRequired, requireRoles } = require('../middleware/auth');

const router = express.Router();

const bannerDir = path.join(process.env.UPLOAD_DIR || './uploads', 'banners');

if (!fs.existsSync(bannerDir)) {
  fs.mkdirSync(bannerDir, { recursive: true });
}

const allowedImageExt = new Set(['.png', '.jpg', '.jpeg', '.webp']);

const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, bannerDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  }
});

const bannerFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedImageExt.has(ext)) {
    return cb(new Error('Only PNG, JPG, JPEG and WEBP images are allowed'));
  }

  cb(null, true);
};

const uploadBanner = multer({
  storage: bannerStorage,
  fileFilter: bannerFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

// Get active banners for students
router.get('/', authRequired, async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, title, subtitle, badge_text, button_text,
              button_link, image_url, background_color, display_order
       FROM banners
       WHERE is_active = TRUE
       ORDER BY display_order ASC, id DESC`
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// Get all banners for admin
router.get('/admin', authRequired, requireRoles('admin'), async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT b.*, u.full_name AS created_by_name
       FROM banners b
       LEFT JOIN users u ON u.id = b.created_by
       ORDER BY b.display_order ASC, b.id DESC`
    );

    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});


// Upload banner image
router.post('/upload', authRequired, requireRoles('admin'), uploadBanner.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Banner image is required' });
    }

    res.status(201).json({
      image_url: `/uploads/banners/${req.file.filename}`
    });
  } catch (err) {
    next(err);
  }
});

// Create banner
router.post('/', authRequired, requireRoles('admin'), async (req, res, next) => {
  try {
    const {
      title,
      subtitle = '',
      badge_text = '',
      button_text = '',
      button_link = '',
      image_url = '',
      background_color = '',
      is_active = true,
      display_order = 0
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Banner title is required' });
    }

    const result = await pool.query(
      `INSERT INTO banners
       (title, subtitle, badge_text, button_text, button_link,
        image_url, background_color, is_active, display_order, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [
        title.trim(),
        subtitle,
        badge_text,
        button_text,
        button_link,
        image_url,
        background_color,
        Boolean(is_active),
        Number(display_order) || 0,
        req.user.id
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Update banner
router.put('/:id', authRequired, requireRoles('admin'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      subtitle = '',
      badge_text = '',
      button_text = '',
      button_link = '',
      image_url = '',
      background_color = '',
      is_active = true,
      display_order = 0
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Banner title is required' });
    }

    const result = await pool.query(
      `UPDATE banners
       SET title = $1,
           subtitle = $2,
           badge_text = $3,
           button_text = $4,
           button_link = $5,
           image_url = $6,
           background_color = $7,
           is_active = $8,
           display_order = $9,
           updated_at = NOW()
       WHERE id = $10
       RETURNING *`,
      [
        title.trim(),
        subtitle,
        badge_text,
        button_text,
        button_link,
        image_url,
        background_color,
        Boolean(is_active),
        Number(display_order) || 0,
        id
      ]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// Delete banner
router.delete('/:id', authRequired, requireRoles('admin'), async (req, res, next) => {
  try {
    const result = await pool.query(
      'DELETE FROM banners WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({ error: 'Banner not found' });
    }

    res.json({ message: 'Banner deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
