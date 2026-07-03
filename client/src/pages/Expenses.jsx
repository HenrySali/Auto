import { useState, useEffect } from 'react';
import api from '../services/api';

const CATS = [
  { v: 'mantenimiento', l: 'Mantenimiento', i: '🔧' },
  { v: 'seguro', l: 'Seguro', i: '🛡️' },
  { v: 'combustible', l: 'Combustible', i: '⛽' },
  { v: 'lavado', l: 'Lavado', i: '🧽' },
  { v: 'multa', l: 'Multa', i: '🚨' },
  { v: 'verificacion', l: 'Verificacion', i: '📋' },
  { v: 'otro', l: 'Otro', i: '📌' },
];

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState('mantenimiento');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { load(); }, []);
  const load = () => { api.get('/expenses').then(r => setExpenses(r.data)); api.get('/expenses/summary').then(r => setSummary(r.data)); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setMessage('');
    try { await api.post('/expenses', { category, amount: parseInt(amount), description: description || undefined, date }); setMessage('Gasto registrado'); setShowForm(false); setAmount(''); setDescription(''); load(); }
    catch (err) { setMessage(err.response?.data?.error || 'Error'); }
    finally { setLoading(false); }
  };

  const del = async (id) => { if(!confirm('Eliminar gasto?')) return; await api.delete(`/expenses/${id}`); load(); };
  const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
  const cat = (v) => CATS.find(c => c.v === v) || CATS[6];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center"><h2 className="text-xl font-bold">Gastos del Vehiculo</h2><button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm">{showForm ? 'Cancelar' : '+ Nuevo'}</button></div>
      {summary && <div className="card"><h3 className="font-medium text-sm text-gray-500 mb-2">Total: {fmt(summary.total)}</h3>{summary.categories.map(c => <div key={c.category} className="flex justify-between text-sm"><span>{cat(c.category).i} {cat(c.category).l}</span><span className="font-medium">{fmt(c.total)}</span></div>)}</div>}
      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-3 border-primary/30">
          <div><label className="label">Categoria</label><select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>{CATS.map(c => <option key={c.v} value={c.v}>{c.i} {c.l}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="label">Monto</label><input type="number" className="input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="150000" required /></div><div><label className="label">Fecha</label><input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} required /></div></div>
          <div><label className="label">Descripcion</label><input type="text" className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalle" /></div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Guardando...' : 'Registrar'}</button>
          {message && <p className="text-sm text-center text-success">{message}</p>}
        </form>
      )}
      <div className="space-y-2">{expenses.map(exp => <div key={exp.id} className="card flex justify-between items-center"><div className="flex items-center gap-3"><span className="text-xl">{cat(exp.category).i}</span><div><p className="text-sm font-medium">{cat(exp.category).l}</p><p className="text-xs text-gray-400">{exp.date}{exp.description && ` - ${exp.description}`}</p></div></div><div className="flex items-center gap-2"><span className="text-sm font-bold text-danger">{fmt(exp.amount)}</span><button onClick={() => del(exp.id)} className="text-gray-300 hover:text-danger text-xs">x</button></div></div>)}</div>
    </div>
  );
}

export default Expenses;
