const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configurar multer para subida de fotos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../client/public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'vehicle-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes (jpg, png, webp)'));
  }
});

// POST /api/photos - Subir foto(s) del vehículo
router.post('/', authenticateToken, upload.array('photos', 10), (req, res) => {
  try {
    const { delivery_id, description, date } = req.body;
    const conductor_id = req.user.id;
    const photoDate = date || new Date().toISOString().split('T')[0];

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Debe subir al menos una foto' });
    }

    const insertStmt = db.prepare(`
      INSERT INTO vehicle_photos (delivery_id, conductor_id, photo_url, description, date)
      VALUES (?, ?, ?, ?, ?)
    `);

    const photos = [];
    for (const file of req.files) {
      const photo_url = '/uploads/' + file.filename;
      const result = insertStmt.run(
        delivery_id || null,
        conductor_id,
        photo_url,
        description || null,
        photoDate
      );
      photos.push({ id: result.lastInsertRowid, photo_url, date: photoDate });
    }

    res.status(201).json({ message: 'Fotos subidas', photos });
  } catch (error) {
    res.status(500).json({ error: 'Error al subir fotos' });
  }
});

// GET /api/photos - Obtener fotos
router.get('/', authenticateToken, (req, res) => {
  try {
    const { date, delivery_id } = req.query;

    let query = `
      SELECT vp.*, u.name as conductor_name 
      FROM vehicle_photos vp 
      JOIN users u ON vp.conductor_id = u.id 
      WHERE 1=1
    `;
    const params = [];

    if (date) {
      query += ' AND vp.date = ?';
      params.push(date);
    }
    if (delivery_id) {
      query += ' AND vp.delivery_id = ?';
      params.push(delivery_id);
    }

    query += ' ORDER BY vp.date DESC, vp.created_at DESC';

    const photos = db.prepare(query).all(...params);
    res.json(photos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener fotos' });
  }
});

module.exports = router;
