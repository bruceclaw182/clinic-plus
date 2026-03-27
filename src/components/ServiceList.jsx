import { useState } from 'react';
import { useServices } from '../hooks/useAppointments';
import { generateId } from '../utils/generateId';
import { formatCurrency } from '../utils/formatCurrency';

const SERVICE_COLORS = [
  'bg-teal-500', 'bg-blue-500', 'bg-purple-500', 'bg-pink-500',
  'bg-orange-500', 'bg-green-500', 'bg-red-500', 'bg-indigo-500',
];

export default function ServiceList() {
  const [services, setServices] = useServices();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', duration: 30, price: 80000, color: SERVICE_COLORS[0] });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (editingId) {
      setServices(services.map(s => s.id === editingId ? { ...s, ...form } : s));
      setEditingId(null);
    } else {
      setServices([...services, { id: generateId(), ...form, createdAt: Date.now() }]);
    }
    setForm({ name: '', duration: 30, price: 80000, color: SERVICE_COLORS[0] });
    setShowForm(false);
  };

  const handleEdit = (service) => {
    setForm({ name: service.name, duration: service.duration, price: service.price, color: service.color });
    setEditingId(service.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (confirm('¿Eliminar este servicio?')) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Servicios</h2>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm({ name: '', duration: 30, price: 80000, color: SERVICE_COLORS[0] }); }}
          className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors font-medium"
        >
          + Nuevo Servicio
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{editingId ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del servicio</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Ej: Consulta General"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Duración (minutos)</label>
                <input
                  type="number"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min="10"
                  max="480"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Precio (COP)</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  min="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Color</label>
              <div className="flex gap-2 flex-wrap">
                {SERVICE_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm({ ...form, color })}
                    className={`w-8 h-8 rounded-full ${color} ${form.color === color ? 'ring-2 ring-offset-2 ring-slate-800' : ''}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 font-medium">
                {editingId ? 'Guardar Cambios' : 'Crear Servicio'}
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
        {services.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500">
            <p className="text-4xl mb-3">💆</p>
            <p>No hay servicios aún. ¡Crea tu primer servicio!</p>
          </div>
        )}
        {services.map((service) => (
          <div key={service.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-4 h-4 rounded-full mt-1 ${service.color}`} />
              <div className="flex gap-2">
                <button onClick={() => handleEdit(service)} className="text-slate-400 hover:text-teal-600 text-sm">Editar</button>
                <button onClick={() => handleDelete(service.id)} className="text-slate-400 hover:text-red-500 text-sm">Eliminar</button>
              </div>
            </div>
            <h3 className="font-semibold text-slate-800 text-lg">{service.name}</h3>
            <div className="mt-2 flex items-center justify-between text-sm text-slate-600">
              <span className="flex items-center gap-1">⏱️ {service.duration} min</span>
              <span className="font-semibold text-teal-600">{formatCurrency(service.price)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
