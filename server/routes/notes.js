const express = require('express');
const db = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// POST /api/notes - Crear nota
router.post('/', authenticateToken, (req, res) => {
  try {
    const { content, priority } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'El contenido es requerido' });
    }

    const result = db.prepare(`
      INSERT INTO notes (author_id, content, priority)
      VALUES (?, ?, ?)
    `).run(req.user.id, content, priority || 'normal');

    res.status(201).json({
      id: result.lastInsertRowid,
      author_id: req.user.id,
      author_name: req.user.name,
      content,
      priority: priority || 'normal',
      created_at: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear nota' });
  }
});

// GET /api/notes - Listar notas
router.get('/', authenticateToken, (req, res) => {
  try {
    const notes = db.prepare(`
      SELECT n.*, u.name as author_name, u.role as author_role
      FROM notes n 
      JOIN users u ON n.author_id = u.id 
      ORDER BY n.created_at DESC
      LIMIT 50
    `).all();

    // Marcar como leídas
    if (req.user.role === 'admin') {
      db.prepare('UPDATE notes SET read_by_admin = 1 WHERE read_by_admin = 0').run();
    } else {
      db.prepare('UPDATE notes SET read_by_conductor = 1 WHERE read_by_conductor = 0').run();
    }

    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener notas' });
  }
});

// GET /api/notes/unread - Contar no leídas
router.get('/unread', authenticateToken, (req, res) => {
  try {
    const field = req.user.role === 'admin' ? 'read_by_admin' : 'read_by_conductor';
    const count = db.prepare(`SELECT COUNT(*) as count FROM notes WHERE ${field} = 0`).get();
    res.json({ unread: count.count });
  } catch (error) {
    res.status(500).json({ error: 'Error al contar notas' });
  }
});

module.exports = router;
