const express = require('express');
const db = require('../db/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// POST /api/expenses - Registrar gasto (admin)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { category, amount, description, date } = req.body;

    if (!category || !amount || !date) {
      return res.status(400).json({ error: 'category, amount y date son requeridos' });
    }

    const validCategories = ['mantenimiento', 'seguro', 'combustible', 'lavado', 'multa', 'verificacion', 'otro'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Categoría inválida' });
    }

    const result = db.prepare(`
      INSERT INTO vehicle_expenses (category, amount, description, date, created_at_by)
      VALUES (?, ?, ?, ?, ?)
    `).run(category, amount, description || null, date, req.user.id);

    res.status(201).json({ id: result.lastInsertRowid, category, amount, description, date });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar gasto' });
  }
});

// GET /api/expenses - Listar gastos
router.get('/', authenticateToken, (req, res) => {
  try {
    const { from, to, category } = req.query;

    let query = 'SELECT * FROM vehicle_expenses WHERE 1=1';
    const params = [];

    if (from) {
      query += ' AND date >= ?';
      params.push(from);
    }
    if (to) {
      query += ' AND date <= ?';
      params.push(to);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY date DESC';

    const expenses = db.prepare(query).all(...params);
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener gastos' });
  }
});

// GET /api/expenses/summary - Resumen de gastos
router.get('/summary', authenticateToken, (req, res) => {
  try {
    const { from, to } = req.query;

    let query = `
      SELECT 
        category,
        SUM(amount) as total,
        COUNT(*) as count
      FROM vehicle_expenses
      WHERE 1=1
    `;
    const params = [];

    if (from) {
      query += ' AND date >= ?';
      params.push(from);
    }
    if (to) {
      query += ' AND date <= ?';
      params.push(to);
    }

    query += ' GROUP BY category ORDER BY total DESC';

    const summary = db.prepare(query).all(...params);
    const totalExpenses = summary.reduce((acc, s) => acc + s.total, 0);

    res.json({ categories: summary, total: totalExpenses });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener resumen' });
  }
});

// DELETE /api/expenses/:id - Eliminar gasto (admin)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM vehicle_expenses WHERE id = ?').run(req.params.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Gasto no encontrado' });
    }
    res.json({ message: 'Gasto eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar gasto' });
  }
});

module.exports = router;
