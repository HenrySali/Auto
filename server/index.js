const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../client/public/uploads')));

// Health check para Railway
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rutas API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/km', require('./routes/km'));
app.use('/api/deliveries', require('./routes/deliveries'));
app.use('/api/photos', require('./routes/photos'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/vehicle', require('./routes/vehicle'));
app.use('/api/notes', require('./routes/notes'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Servir frontend (siempre, para que funcione en producción)
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

module.exports = app;
