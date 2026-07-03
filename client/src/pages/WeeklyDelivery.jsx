import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function WeeklyDelivery() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [weekStart, setWeekStart] = useState('');
  const [weekEnd, setWeekEnd] = useState('');
  const [kmTotal, setKmTotal] = useState('');
  const [amountPaid, setAmountPaid] = useState('420000');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { loadDeliveries(); }, []);
  const loadDeliveries = async () => { try { const r = await api.get('/deliveries'); setDeliveries(r.data); } catch(e) {} };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setMessage('');
    try {
      await api.post('/deliveries', { week_start: weekStart, week_end: weekEnd, km_total: parseInt(kmTotal) || 0, amount_paid: parseInt(amountPaid), notes: notes || undefined });
      setMessage('Entrega registrada'); setShowForm(false); setNotes(''); loadDeliveries();
    } catch (err) { setMessage(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  };

  const confirmDelivery = async (id, amount) => { try { await api.put(`/deliveries/${id}/confirm`, { amount_paid: amount }); loadDeliveries(); } catch(e) {} };
  const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h2 className="text-xl font-bold">Entregas Semanales</h2><button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">{showForm ? 'Cancelar' : '+ Nueva'}</button></div>
      <div className="card bg-blue-50 border-blue-200"><p className="text-sm text-blue-700">Renta semanal: <strong>{fmt(420000)}</strong> - Entrega: Sabados</p></div>
      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-3 border-primary/30">
          <h3 className="font-medium">Nueva entrega</h3>
          <div className="grid grid-cols-2 gap-3"><div><label className="label">Desde</label><input type="date" className="input" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} required /></div><div><label className="label">Hasta</label><input type="date" className="input" value={weekEnd} onChange={(e) => setWeekEnd(e.target.value)} required /></div></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="label">Km semana</label><input type="number" className="input" value={kmTotal} onChange={(e) => setKmTotal(e.target.value)} placeholder="1500" /></div><div><label className="label">Monto pagado</label><input type="number" className="input" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} required /></div></div>
          <div><label className="label">Notas</label><textarea className="input" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observaciones..." /></div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Guardando...' : 'Registrar'}</button>
          {message && <p className="text-sm text-center text-success">{message}</p>}
        </form>
      )}
      <div className="space-y-3">
        {deliveries.length === 0 ? <div className="card text-center text-gray-400">No hay entregas</div> :
          deliveries.map(d => (
            <div key={d.id} className="card">
              <div className="flex justify-between items-start"><div><p className="text-sm font-medium">{d.week_start} - {d.week_end}</p><p className="text-xs text-gray-400">{d.km_total} km</p>{d.notes && <p className="text-xs text-gray-500 mt-1">{d.notes}</p>}</div><span className={`text-xs px-2 py-1 rounded-full font-medium ${d.status === 'pagado' ? 'bg-green-100 text-green-700' : d.status === 'parcial' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{d.status}</span></div>
              <div className="mt-2 flex justify-between items-center text-sm"><span>Pagado: <strong>{fmt(d.amount_paid)}</strong> / {fmt(d.amount_due)}</span>{user?.role === 'admin' && !d.confirmed_by_admin && <button onClick={() => confirmDelivery(d.id, d.amount_paid)} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Confirmar</button>}{d.confirmed_by_admin === 1 && <span className="text-xs text-green-600">Confirmado</span>}</div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default WeeklyDelivery;
