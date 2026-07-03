import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

function Notes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadNotes(); }, []);
  const loadNotes = async () => { try { const r = await api.get('/notes'); setNotes(r.data); } catch(e) {} };

  const handleSubmit = async (e) => {
    e.preventDefault(); if (!content.trim()) return; setLoading(true);
    try { await api.post('/notes', { content, priority }); setContent(''); setPriority('normal'); loadNotes(); }
    catch(e) {} finally { setLoading(false); }
  };

  const fmtDate = (d) => new Date(d).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Notas y Avisos</h2>
      <form onSubmit={handleSubmit} className="card space-y-3">
        <textarea className="input" rows={3} value={content} onChange={(e) => setContent(e.target.value)} placeholder="Escribe una nota..." required />
        <div className="flex gap-2 items-center">
          <select className="input w-auto" value={priority} onChange={(e) => setPriority(e.target.value)}><option value="normal">Normal</option><option value="urgente">Urgente</option></select>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>{loading ? 'Enviando...' : 'Enviar'}</button>
        </div>
      </form>
      <div className="space-y-2">
        {notes.length === 0 ? <div className="card text-center text-gray-400">No hay notas</div> :
          notes.map(n => (
            <div key={n.id} className={`card ${n.priority === 'urgente' ? 'border-danger/50 bg-red-50/50' : ''} ${n.author_id === user?.id ? 'ml-4' : 'mr-4'}`}>
              <div className="flex justify-between items-start mb-1"><span className="text-xs font-medium text-primary">{n.author_name} ({n.author_role === 'admin' ? 'Admin' : 'Conductor'})</span>{n.priority === 'urgente' && <span className="text-xs text-danger font-bold">URGENTE</span>}</div>
              <p className="text-sm">{n.content}</p>
              <p className="text-xs text-gray-400 mt-1">{fmtDate(n.created_at)}</p>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default Notes;
