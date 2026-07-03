import { useState, useEffect } from 'react';
import api from '../services/api';

function Photos() {
  const [photos, setPhotos] = useState([]);
  const [files, setFiles] = useState(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { loadPhotos(); }, []);
  const loadPhotos = async () => { try { const r = await api.get('/photos'); setPhotos(r.data); } catch(e) {} };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files || files.length === 0) { setMessage('Selecciona al menos una foto'); return; }
    setLoading(true); setMessage('');
    try {
      const fd = new FormData();
      for (let i = 0; i < files.length; i++) fd.append('photos', files[i]);
      fd.append('description', description); fd.append('date', date);
      await api.post('/photos', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('Fotos subidas'); setFiles(null); setDescription('');
      document.getElementById('photo-input').value = '';
      loadPhotos();
    } catch (err) { setMessage(err.response?.data?.error || 'Error al subir'); }
    finally { setLoading(false); }
  };

  const grouped = photos.reduce((acc, p) => { if (!acc[p.date]) acc[p.date] = []; acc[p.date].push(p); return acc; }, {});

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Fotos del Vehiculo</h2>
      <div className="card bg-blue-50 border-blue-200"><p className="text-sm text-blue-700">Sube fotos del estado del carro cada sabado</p></div>
      <form onSubmit={handleSubmit} className="card space-y-3">
        <h3 className="font-medium text-sm">Subir fotos</h3>
        <input id="photo-input" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => setFiles(e.target.files)} className="input text-sm" />
        <div className="grid grid-cols-2 gap-3"><div><label className="label">Fecha</label><input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /></div><div><label className="label">Descripcion</label><input type="text" className="input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="ej: Frente" /></div></div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Subiendo...' : 'Subir fotos'}</button>
        {message && <p className={`text-sm text-center ${message.includes('Error') || message.includes('Selecciona') ? 'text-danger' : 'text-success'}`}>{message}</p>}
      </form>
      {Object.keys(grouped).length === 0 ? <div className="card text-center text-gray-400">No hay fotos</div> :
        Object.entries(grouped).map(([d, ps]) => (
          <div key={d} className="card"><h3 className="font-medium text-sm text-gray-500 mb-2">{d}</h3><div className="grid grid-cols-2 gap-2">{ps.map(p => <div key={p.id}><img src={p.photo_url} alt={p.description || 'Foto'} className="w-full h-32 object-cover rounded-lg" />{p.description && <p className="text-xs text-gray-500 mt-1">{p.description}</p>}</div>)}</div><p className="text-xs text-gray-400 mt-2">Por: {ps[0].conductor_name}</p></div>
        ))
      }
    </div>
  );
}

export default Photos;
