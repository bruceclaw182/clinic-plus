import { useState } from 'react';
import { useClients } from '../hooks/useAppointments';
import { useAppointments } from '../hooks/useAppointments';
import { generateId } from '../utils/generateId';

export default function ClientList() {
  const [clients, setClients] = useClients();
  const [appointments] = useAppointments();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingId) {
      setClients(clients.map(c => c.id === editingId ? { ...c, ...form } : c));
      setEditingId(null);
    } else {
      setClients([...clients, { id: generateId(), ...form, createdAt: Date.now() }]);
    }
    setForm({ name: '', phone: '', email: '' });
    setShowForm(false);
  };

  const handleEdit = (client) => {
    setForm({ name: client.name, phone: client.phone, email: client.email });
    setEditingId(client.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('¿Eliminar este cliente?')) {
      setClients(clients.filter(c => c.id !== id));
    }
  };

  const getClientAppointments = (clientId) => {
    return appointments.filter(a => a.clientId === clientId);
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 10) {
      return `+57 ${clean.slice(0, 3)} ${clean.slice(3, 6)} ${clean.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Clientes</h2>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', phone: '', email: '' }); }}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium"
        >
          + Nuevo Cliente
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{editingId ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Nombre del cliente"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono / WhatsApp</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="300 123 4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="cliente@email.com"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 font-medium">
                {editingId ? 'Guardar Cambios' : 'Crear Cliente'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">
            <p className="text-4xl mb-3">👥</p>
            <p>No hay clientes aún. ¡Agrega tu primer cliente!</p>
          </div>
        )}
        {clients.map((client) => {
          const clientApts = getClientAppointments(client.id);
          return (
            <div key={client.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center font-bold text-lg">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(client)} className="text-slate-400 hover:text-teal-600 text-sm">Editar</button>
                  <button onClick={() => handleDelete(client.id)} className="text-slate-400 hover:text-red-500 text-sm">Eliminar</button>
                </div>
              </div>
              <h3 className="font-semibold text-slate-800 text-lg">{client.name}</h3>
              {client.phone && (
                <a href={`https://wa.me/57${client.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-800 mt-1">
                  📱 {formatPhone(client.phone)}
                </a>
              )}
              {client.email && (
                <a href={`mailto:${client.email}`} className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800 mt-1">
                  ✉️ {client.email}
                </a>
              )}
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  {clientApts.length} cita{clientApts.length !== 1 ? 's' : ''} registrada{clientApts.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
