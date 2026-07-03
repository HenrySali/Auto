# 🚗 Auto Manager - Gestión de Auto en Cabify

App para gestionar el alquiler semanal de un auto en Cabify. Permite al admin/dueño y al conductor estar alineados con la operación.

## Modelo de negocio
- Renta semanal fija: **$420,000 COP**
- Día de entrega: **Sábados**
- El conductor registra km diario y sube fotos del estado del carro cada sábado


## Roles
- **Admin/Dueño**: Control total - ve ingresos, gastos, confirma entregas, programa mantenimientos
- **Conductor**: Registra km diario, paga renta semanal, sube fotos del estado del auto

## Funcionalidades
- Registro diario de kilometraje
- Entregas semanales con control de pagos
- Fotos del estado del vehículo (sábados)
- Gastos del vehículo (admin)
- Mantenimientos programados y alertas de vencimientos
- Notas/comunicación entre todos
- Dashboard con resumen financiero

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS (mobile-first)
- **Backend**: Node.js + Express
- **Base de datos**: SQLite (better-sqlite3)
- **Auth**: JWT

## Deploy en Railway (Producción)

1. Crea cuenta en [railway.app](https://railway.app)
2. Nuevo proyecto → "Deploy from GitHub repo"
3. Selecciona este repo (`HenrySali/Auto`)
4. Agrega variable de entorno: `JWT_SECRET` = (una clave secreta cualquiera)
5. Railway detecta el Dockerfile y despliega automáticamente
6. Te da una URL pública tipo `https://auto-production-xxxx.up.railway.app`

## Desarrollo local

```bash
npm run install:all
npm run dev:server   # Puerto 3001
npm run dev:client   # Puerto 5173
```

## Primer uso
1. Registra una cuenta con rol "admin" (para ti y tu cuñado)
2. Registra otra cuenta con rol "conductor"
3. ¡Listo! Cada quien ve su interfaz según su rol
