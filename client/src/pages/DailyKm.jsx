import { useState, useEffect } from 'react';
import api from '../services/api';

function DailyKm() {
  const [kmStart, setKmStart] = useState('');
  const [kmEnd, setKmEnd] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [todayRecord, setTodayRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { loadRecords(); loadToday(); }, []);

  const loadRecords = async () => { try { const r = await api.get('/km'); setRecords(r.data); } catch(e) {} };
  const loadToday = async () => { try { const r = await api.get('/km/today'); if (r.data) { setTodayRecord(r.data); setKmStart(r.data.km_start.toString()); setKmEnd(r.data.km_end.toString()); } } catch(e) {} };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setMessage('');
    try {
      await api.post('/km', { km_start: parseInt(kmStart), km_end: parseInt(kmEnd), date, notes: notes || undefined });
      setMessage('Kilometraje registrado'); setNotes(''); loadRecords(); loadToday();
    } catch (err) { setMessage(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Kilometraje Diario</h2>
      <form onSubmit={handleSubmit} className="card space-y-3">
        <div><label className="label">Fecha</label><input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Km inicio</label><input type="number" className="input" value={kmStart} onChange={(e) => setKmStart(e.target.value)} placeholder="45000" required /></div>
          <div><label className="label">Km fin</label><input type="number" className="input" value={kmEnd} onChange={(e) => setKmEnd(e.target.value)} placeholder="45200" required /></div>
        </div>
        {kmStart && kmEnd && <p className="text-sm text-gray-500">Recorrido: <strong>{(parseInt(kmEnd) - parseInt(kmStart)).toLocaleString()} km</strong></p>}
        <div><label className="label">Novedades (opcional)</label><textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Alguna novedad..." /></div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Guardando...' : todayRecord ? 'Actualizar' : 'Registrar km'}</button>
        {message && <p className={`text-sm text-center ${message.includes('Error') ? 'text-danger' : 'text-success'}`}>{message}</p>}
      </form>
      <div className="card"><h3 className="font-medium text-sm text-gray-500 mb-2">Historial</h3>
        {records.length === 0 ? <p className="text-sm text-gray-400">Sin registros</p> :
          records.slice(0, 14).map(r => <div key={r.id} className="flex justify-between items-center py-2 border-b last:border-0"><div><p className="text-sm font-medium">{r.date}</p><p className="text-xs text-gray-400">{r.km_start} - {r.km_end}</p></div><span className="text-sm font-bold text-primary">{r.km_driven} km</span></div>)
        }
      </div>
    </div>
  );
}

export default DailyKm;
