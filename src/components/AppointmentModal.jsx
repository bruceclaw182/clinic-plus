import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { useAppointments } from '../hooks/useAppointments';
import { useServices } from '../hooks/useAppointments';
import { useClients } from '../hooks/useAppointments';
import { generateId } from '../utils/generateId';
import { formatCurrency } from '../utils/formatCurrency';

export default function AppointmentModal({ date, time, appointment, onClose, onCancel, onComplete }) {
  const [appointments, setAppointments] = useAppointments();
  const [services] = useServices();
  const [clients] = useClients();
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [whatsAppMessage, setWhatsAppMessage] = useState('');

  const [form, setForm] = useState({
    clientId: '',
    serviceId: '',
    date: date || '',
    time: time || '09:00',
    notes: '',
  });

  useEffect(() => {
    if (appointment) {
      setForm({
        clientId: appointment.clientId || '',
        serviceId: appointment.serviceId || '',
        date: appointment.date || date || '',
        time: appointment.time || time || '09:00',
        notes: appointment.notes || '',
      });
    } else {
      setForm({
        clientId: '',
        serviceId: services.length > 0 ? services[0].id : '',
        date: date || '',
        time: time || '09:00',
        notes: '',
      });
    }
  }, [appointment, date, time, services]);

  const selectedService = services.find(s => s.id === form.serviceId);
  const selectedClient = clients.find(c => c.id === form.clientId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.clientId || !form.serviceId || !form.date || !form.time) return;

    const service = services.find(s => s.id === form.serviceId);

    if (appointment) {
      setAppointments(appointments.map(a =>
        a.id === appointment.id ? { ...a, ...form, status: 'confirmed' } : a
      ));
    } else {
      setAppointments([...appointments, {
        id: generateId(),
        ...form,
        duration: service?.duration || 30,
        status: 'confirmed',
        createdAt: Date.now(),
      }]);
    }
    onClose();
  };

  const handleDelete = () => {
    if (appointment && confirm('¿Eliminar esta cita?')) {
      setAppointments(appointments.filter(a => a.id !== appointment.id));
      onClose();
    }
  };

  const sendWhatsAppNotification = (type) => {
    const client = selectedClient;
    if (!client?.phone) return;

    const phone = client.phone.replace(/\D/g, '');
    let message = '';

    if (type === 'confirm') {
      message = `✅ *Confirmación de cita*\n\nHola ${client.name}, tu cita ha sido confirmada.\n\n📅 Fecha: ${format(parseISO(form.date), 'dd/MM/yyyy')}\n⏰ Hora: ${form.time}\n💆 Servicio: ${selectedService?.name || ''}\n\n¡Te esperamos!`;
    } else if (type === 'reminder') {
      message = `🔔 *Recordatorio de cita*\n\nHola ${client.name}, te recordamos tu cita mañana.\n\n📅 Fecha: ${format(parseISO(form.date), 'dd/MM/yyyy')}\n⏰ Hora: ${form.time}\n💆 Servicio: ${selectedService?.name || ''}\n\n¿Necesitas reprogramar? Contáctanos.`;
    }

    setWhatsAppMessage(decodeURIComponent(message));
    setShowWhatsApp(true);

    const encodedMsg = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/57${phone}?text=${encodedMsg}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-800">
              {appointment ? 'Editar Cita' : 'Nueva Cita'}
            </h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">&times;</button>
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
            <span>📅 {form.date ? format(parseISO(form.date), 'dd MMM yyyy', { locale: require('date-fns/locale/es') }) : ''}</span>
            <span>⏰ {form.time}</span>
            {selectedService && (
              <>
                <span>💆 {selectedService.name}</span>
                <span className="text-teal-600 font-medium">{formatCurrency(selectedService.price)}</span>
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Servicio *</label>
            <select
              value={form.serviceId}
              onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            >
              <option value="">Seleccionar servicio</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name} - {s.duration}min - {formatCurrency(s.price)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cliente *</label>
            <select
              value={form.clientId}
              onChange={(e) => setForm({ ...form, clientId: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            >
              <option value="">Seleccionar cliente</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hora *</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              rows="3"
              placeholder="Notas adicionales..."
            />
          </div>

          {appointment && (
            <div className="flex items-center gap-2 pt-2">
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                appointment.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                'bg-slate-100 text-slate-700'
              }`}>
                {appointment.status === 'confirmed' ? '✅ Confirmada' :
                 appointment.status === 'cancelled' ? '❌ Cancelada' :
                 '✅ Completada'}
              </span>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
            <button type="submit" className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 font-medium">
              {appointment ? 'Guardar Cambios' : 'Crear Cita'}
            </button>
            {appointment && (
              <>
                <button
                  type="button"
                  onClick={() => onComplete(appointment.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-medium"
                >
                  Completar
                </button>
                <button
                  type="button"
                  onClick={() => onCancel(appointment.id)}
                  className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 font-medium"
                >
                  Eliminar
                </button>
              </>
            )}
          </div>
        </form>

        {/* WhatsApp Notification Section */}
        {selectedClient && selectedService && (
          <div className="p-6 pt-0 mt-2">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                📱 Notificaciones WhatsApp (mock)
              </h4>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => sendWhatsAppNotification('confirm')}
                  className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 font-medium"
                >
                  📩 Confirmar cita
                </button>
                <button
                  onClick={() => sendWhatsAppNotification('reminder')}
                  className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 font-medium"
                >
                  🔔 Recordar cita
                </button>
              </div>
              {showWhatsApp && whatsAppMessage && (
                <div className="mt-3 bg-white rounded-lg p-3 text-sm text-slate-700 whitespace-pre-wrap font-mono">
                  <strong className="text-green-800">Mensaje que se enviaría:</strong>
                  <pre className="mt-1 text-xs whitespace-pre-wrap">{whatsAppMessage}</pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
