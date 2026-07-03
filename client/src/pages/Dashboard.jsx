import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(res => setData(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center py-8">Cargando...</p>;
  if (!data) return <p className="text-center py-8 text-danger">Error al cargar datos</p>;

  const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Hola, {user?.name}</h2>
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center"><p className="text-xs text-gray-500">Ingresos (renta)</p><p className="text-lg font-bold text-success">{fmt(data.income.total)}</p></div>
        <div className="card text-center"><p className="text-xs text-gray-500">Gastos vehiculo</p><p className="text-lg font-bold text-danger">{fmt(data.expenses.total)}</p></div>
        <div className="card text-center"><p className="text-xs text-gray-500">Ganancia neta</p><p className={`text-lg font-bold ${data.income.net_profit >= 0 ? 'text-success' : 'text-danger'}`}>{fmt(data.income.net_profit)}</p></div>
        <div className="card text-center"><p className="text-xs text-gray-500">Deuda pendiente</p><p className={`text-lg font-bold ${data.debt.total > 0 ? 'text-warning' : 'text-success'}`}>{fmt(data.debt.total)}</p></div>
      </div>
      {data.last_km && <div className="card"><h3 className="font-medium text-sm text-gray-500 mb-1">Ultimo km</h3><p className="text-lg font-bold">{data.last_km.km_end.toLocaleString()} km</p><p className="text-xs text-gray-400">{data.last_km.date}</p></div>}
      {data.upcoming_alerts.length > 0 && <div className="card border-warning/50"><h3 className="font-medium text-sm text-warning mb-2">Alertas proximas</h3>{data.upcoming_alerts.map(a => <div key={a.id} className="flex justify-between items-center py-1 border-b last:border-0"><span className="text-sm">{a.title}</span><span className="text-xs text-gray-400">{a.due_date}</span></div>)}</div>}
      {data.pending_maintenance.length > 0 && <div className="card"><h3 className="font-medium text-sm text-gray-500 mb-2">Mantenimientos pendientes</h3>{data.pending_maintenance.map(m => <div key={m.id} className="flex justify-between items-center py-1 border-b last:border-0"><span className="text-sm">{m.title}</span><span className="text-xs text-gray-400">{m.due_date || `${m.due_km} km`}</span></div>)}</div>}
      {data.unread_notes > 0 && <div className="card bg-primary/5 border-primary/20"><p className="text-sm text-primary font-medium">{data.unread_notes} nota(s) sin leer</p></div>}
      {data.recent_weeks.length > 0 && <div className="card"><h3 className="font-medium text-sm text-gray-500 mb-2">Ultimas entregas</h3>{data.recent_weeks.map(w => <div key={w.id} className="flex justify-between items-center py-2 border-b last:border-0"><div><p className="text-sm font-medium">{w.week_start} - {w.week_end}</p><p className="text-xs text-gray-400">{w.km_total} km</p></div><span className={`text-xs px-2 py-1 rounded-full font-medium ${w.status === 'pagado' ? 'bg-green-100 text-green-700' : w.status === 'parcial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{w.status}</span></div>)}</div>}
    </div>
  );
}

export default Dashboard;
