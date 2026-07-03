-- Usuarios del sistema
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('admin', 'conductor')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Registro diario de kilometraje
CREATE TABLE IF NOT EXISTS daily_km (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conductor_id INTEGER NOT NULL,
  date DATE NOT NULL,
  km_start INTEGER NOT NULL,
  km_end INTEGER NOT NULL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conductor_id) REFERENCES users(id),
  UNIQUE(conductor_id, date)
);

-- Entregas semanales (sábados)
CREATE TABLE IF NOT EXISTS weekly_deliveries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conductor_id INTEGER NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  km_total INTEGER NOT NULL,
  amount_due INTEGER NOT NULL DEFAULT 420000,
  amount_paid INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK(status IN ('pendiente', 'pagado', 'parcial')),
  notes TEXT,
  confirmed_by_admin INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conductor_id) REFERENCES users(id)
);

-- Fotos del estado del vehículo (sábados)
CREATE TABLE IF NOT EXISTS vehicle_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  delivery_id INTEGER,
  conductor_id INTEGER NOT NULL,
  photo_url TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (delivery_id) REFERENCES weekly_deliveries(id),
  FOREIGN KEY (conductor_id) REFERENCES users(id)
);

-- Gastos del vehículo (admin/dueño)
CREATE TABLE IF NOT EXISTS vehicle_expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL CHECK(category IN ('mantenimiento', 'seguro', 'combustible', 'lavado', 'multa', 'verificacion', 'otro')),
  amount INTEGER NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at_by INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_at_by) REFERENCES users(id)
);

-- Control de mantenimientos programados
CREATE TABLE IF NOT EXISTS maintenance_schedule (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  due_km INTEGER,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK(status IN ('pendiente', 'completado', 'vencido')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Alertas y vencimientos
CREATE TABLE IF NOT EXISTS alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('seguro', 'verificacion', 'licencia', 'mantenimiento', 'otro')),
  status TEXT NOT NULL DEFAULT 'activa' CHECK(status IN ('activa', 'resuelta')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Notas/comunicación entre usuarios
CREATE TABLE IF NOT EXISTS notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  author_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK(priority IN ('normal', 'urgente')),
  read_by_admin INTEGER DEFAULT 0,
  read_by_conductor INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id)
);
