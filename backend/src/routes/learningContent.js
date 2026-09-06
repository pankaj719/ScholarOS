const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const router = express.Router()

const { authRequired, requireRoles } = require('../middleware/auth')

const uploadDir = path.resolve(
  process.env.UPLOAD_DIR || './uploads',
  'learning'
)

fs.mkdirSync(uploadDir, { recursive: true })

const maxBytes =
  (parseInt(process.env.MAX_FILE_SIZE_MB || '10') || 10) *
  1024 *
  1024

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase()

    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase()

    cb(
      null,
      `${Date.now()}-${base || 'file'}${ext}`
    )
  }
})

const allowedExtensions = [
  '.pdf',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.mp4',
  '.webm',
  '.mov',
  '.mkv'
]

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase()

  if (!allowedExtensions.includes(ext)) {
    return cb(
      new Error(
        'Only PDF, DOC, DOCX, PPT, PPTX and common video files are allowed'
      )
    )
  }

  cb(null, true)
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxBytes
  }
})

router.post(
  '/',
  authRequired,
  requireRoles('admin', 'teacher'),
  upload.single('file'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        error: 'File is required'
      })
    }

    res.status(201).json({
      ok: true,
      original_name: req.file.originalname,
      filename: req.file.filename,
      mime_type: req.file.mimetype,
      size: req.file.size,
      file_url: `/uploads/learning/${req.file.filename}`
    })
  }
)

module.exports = router
