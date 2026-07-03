import { useState, useEffect } from 'react';
import api from '../services/api';

function VehicleControl() {
  const [maintenance, setMaintenance] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [showMF, setShowMF] = useState(false);
  const [showAF, setShowAF] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueKm, setDueKm] = useState('');
  const [aType, setAType] = useState('mantenimiento');

  useEffect(() => { load(); }, []);
  const load = () => { api.get('/vehicle/maintenance').then(r => setMaintenance(r.data)); api.get('/vehicle/alerts').then(r => setAlerts(r.data)); };

  const addM = async (e) => { e.preventDefault(); await api.post('/vehicle/maintenance', { title, description: desc, due_date: dueDate || undefined, due_km: dueKm ? parseInt(dueKm) : undefined }); setShowMF(false); setTitle(''); setDesc(''); setDueDate(''); setDueKm(''); load(); };
  const addA = async (e) => { e.preventDefault(); await api.post('/vehicle/alerts', { title, description: desc, due_date: dueDate, type: aType }); setShowAF(false); setTitle(''); setDesc(''); setDueDate(''); load(); };
  const doneM = async (id) => { await api.put(`/vehicle/maintenance/${id}`, { status: 'completado' }); load(); };
  const resolveA = async (id) => { await api.put(`/vehicle/alerts/${id}`, { status: 'resuelta' }); load(); };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Control del Vehiculo</h2>
      <div className="card">
        <div className="flex justify-between items-center mb-2"><h3 className="font-medium text-sm">Alertas / Vencimientos</h3><button onClick={() => { setShowAF(!showAF); setShowMF(false); }} className="text-xs btn-primary">+ Alerta</button></div>
        {showAF && <form onSubmit={addA} className="space-y-2 mb-3 p-3 bg-gray-50 rounded-lg"><input type="text" className="input" placeholder="Titulo" value={title} onChange={(e) => setTitle(e.target.value)} required /><input type="text" className="input" placeholder="Descripcion" value={desc} onChange={(e) => setDesc(e.target.value)} /><div className="grid grid-cols-2 gap-2"><input type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required /><select className="input" value={aType} onChange={(e) => setAType(e.target.value)}><option value="seguro">Seguro</option><option value="verificacion">Verificacion</option><option value="licencia">Licencia</option><option value="mantenimiento">Mantenimiento</option><option value="otro">Otro</option></select></div><button type="submit" className="btn-primary w-full text-sm">Guardar</button></form>}
        {alerts.length === 0 ? <p className="text-sm text-gray-400">Sin alertas activas</p> : alerts.map(a => <div key={a.id} className="flex justify-between items-center py-2 border-b last:border-0"><div><p className="text-sm font-medium">{a.title}</p><p className="text-xs text-gray-400">{a.type} - Vence: {a.due_date}</p></div><button onClick={() => resolveA(a.id)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Resolver</button></div>)}
      </div>
      <div className="card">
        <div className="flex justify-between items-center mb-2"><h3 className="font-medium text-sm">Mantenimientos</h3><button onClick={() => { setShowMF(!showMF); setShowAF(false); }} className="text-xs btn-primary">+ Mant.</button></div>
        {showMF && <form onSubmit={addM} className="space-y-2 mb-3 p-3 bg-gray-50 rounded-lg"><input type="text" className="input" placeholder="Titulo (ej: Cambio aceite)" value={title} onChange={(e) => setTitle(e.target.value)} required /><input type="text" className="input" placeholder="Descripcion" value={desc} onChange={(e) => setDesc(e.target.value)} /><div className="grid grid-cols-2 gap-2"><input type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /><input type="number" className="input" placeholder="A los X km" value={dueKm} onChange={(e) => setDueKm(e.target.value)} /></div><button type="submit" className="btn-primary w-full text-sm">Guardar</button></form>}
        {maintenance.length === 0 ? <p className="text-sm text-gray-400">Sin mantenimientos</p> : maintenance.map(m => <div key={m.id} className="flex justify-between items-center py-2 border-b last:border-0"><div><p className="text-sm font-medium">{m.title}</p><p className="text-xs text-gray-400">{m.due_date && `Fecha: ${m.due_date}`}{m.due_km && ` - ${m.due_km} km`}</p></div><div className="flex gap-1">{m.status === 'pendiente' && <button onClick={() => doneM(m.id)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Hecho</button>}<span className={`text-xs px-2 py-1 rounded ${m.status === 'completado' ? 'bg-green-100 text-green-700' : m.status === 'vencido' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{m.status}</span></div></div>)}
      </div>
    </div>
  );
}

export default VehicleControl;
