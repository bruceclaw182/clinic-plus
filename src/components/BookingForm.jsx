import { useState, useMemo } from 'react';
import { format, addDays, startOfDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useServices } from '../hooks/useAppointments';
import { useClients } from '../hooks/useAppointments';
import { useAppointments } from '../hooks/useAppointments';
import { useConfig } from '../hooks/useAppointments';
import { generateId } from '../utils/generateId';
import { formatCurrency } from '../utils/formatCurrency';

export default function BookingForm() {
  const [services] = useServices();
  const [clients, setClients] = useClients();
  const [appointments, setAppointments] = useAppointments();
  const [config] = useConfig();

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientForm, setClientForm] = useState({ name: '', phone: '', email: '' });
  const [bookingComplete, setBookingComplete] = useState(false);

  const availableDates = useMemo(() => {
    const dates = [];
    const today = startOfDay(new Date());
    for (let i = 0; i < 14; i++) {
      dates.push(addDays(today, i));
    }
    return dates;
  }, []);

  const hours = useMemo(() => {
    const h = [];
    for (let hour = config.startHour; hour <= config.endHour; hour++) {
      h.push(hour);
    }
    return h;
  }, [config]);

  const getAvailableSlots = (date) => {
    if (!selectedService || !date) return hours.map(h => `${h.toString().padStart(2, '0')}:00`);

    const serviceDuration = selectedService.duration;
    const bookedSlots = appointments
      .filter(apt => apt.date === date && apt.serviceId === selectedService.id && apt.status !== 'cancelled')
      .map(apt => apt.time);

    return hours.map(h => `${h.toString().padStart(2, '0')}:00`)
      .filter(time => !bookedSlots.includes(time));
  };

  const availableSlots = getAvailableSlots(selectedDate);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setSelectedDate('');
    setSelectedTime('');
    setStep(2);
  };

  const handleDateSelect = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setSelectedDate(dateStr);
    setSelectedTime('');
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setStep(3);
  };

  const handleClientSubmit = (e) => {
    e.preventDefault();
    if (!clientForm.name.trim() || !clientForm.phone.trim()) return;

    // Check if client exists or create new
    let client = clients.find(c => c.phone === clientForm.phone);
    if (!client) {
      client = { id: generateId(), ...clientForm, createdAt: Date.now() };
      setClients([...clients, client]);
    }

    // Create appointment
    const newApt = {
      id: generateId(),
      clientId: client.id,
      serviceId: selectedService.id,
      date: selectedDate,
      time: selectedTime,
      duration: selectedService.duration,
      status: 'confirmed',
      notes: '',
      createdAt: Date.now(),
    };

    setAppointments([...appointments, newApt]);
    setBookingComplete(true);
  };

  const resetBooking = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTime('');
    setClientForm({ name: '', phone: '', email: '' });
    setBookingComplete(false);
  };

  if (bookingComplete) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">¡Cita reservada con éxito!</h2>
          <p className="text-slate-600 mb-6">
            Te hemos enviado un mensaje de confirmación a tu WhatsApp.
          </p>
          <div className="bg-teal-50 rounded-xl p-6 text-left mb-6">
            <h3 className="font-semibold text-slate-800 mb-3">Detalles de tu cita:</h3>
            <div className="space-y-2 text-sm text-slate-700">
              <p><strong>📅 Fecha:</strong> {format(parseISO(selectedDate), "dd 'de' MMMM 'de' yyyy", { locale: es })}</p>
              <p><strong>⏰ Hora:</strong> {selectedTime}</p>
              <p><strong>💆 Servicio:</strong> {selectedService?.name}</p>
              <p><strong>💰 Precio:</strong> {formatCurrency(selectedService?.price || 0)}</p>
              <p><strong>👤 Cliente:</strong> {clientForm.name}</p>
            </div>
          </div>
          <button
            onClick={resetBooking}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 font-medium"
          >
            Reservar otra cita
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Reservar Cita</h2>
        <p className="text-slate-500">Selecciona el servicio, fecha y hora de tu preferencia</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
              step >= s ? 'bg-teal-600 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {s}
            </div>
            {s < 3 && (
              <div className={`w-12 h-1 mx-1 ${step > s ? 'bg-teal-600' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Service */}
      {step === 1 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">1. Selecciona un servicio</h3>
          {services.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
              <p className="text-4xl mb-3">💆</p>
              <p className="text-slate-500">No hay servicios disponibles</p>
              <p className="text-sm text-slate-400">Agrega servicios desde el panel de administración</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className="bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-teal-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-4 h-4 rounded-full ${service.color}`} />
                    <span className="font-semibold text-slate-800">{service.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">⏱️ {service.duration} min</span>
                    <span className="font-bold text-teal-600">{formatCurrency(service.price)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Date and Time */}
      {step === 2 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">2. Selecciona fecha y hora</h3>
          <div className="mb-6">
            <p className="text-sm text-slate-500 mb-2">Servicio: <strong>{selectedService?.name}</strong> - {selectedService?.duration}min</p>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-medium text-slate-700 mb-2">Fecha</h4>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
              {availableDates.map((date) => (
                <button
                  key={date.toISOString()}
                  onClick={() => handleDateSelect(date)}
                  className={`p-2 rounded-lg text-center transition-colors ${
                    selectedDate === format(date, 'yyyy-MM-dd')
                      ? 'bg-teal-600 text-white'
                      : 'bg-white border border-slate-200 hover:border-teal-500'
                  }`}
                >
                  <div className="text-xs opacity-80">{format(date, 'EEE', { locale: es })}</div>
                  <div className="font-bold">{format(date, 'd')}</div>
                </button>
              ))}
            </div>
          </div>

          {selectedDate && (
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">Hora disponible</h4>
              <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                {availableSlots.length === 0 ? (
                  <div className="col-span-full text-center py-4 text-slate-500">
                    No hay horarios disponibles para este día
                  </div>
                ) : (
                  availableSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={`py-2 px-3 rounded-lg text-center font-medium transition-colors ${
                        selectedTime === time
                          ? 'bg-teal-600 text-white'
                          : 'bg-white border border-slate-200 hover:border-teal-500'
                      }`}
                    >
                      {time}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          <button
            onClick={() => setStep(1)}
            className="mt-6 text-slate-500 hover:text-slate-700 text-sm"
          >
            ← Cambiar servicio
          </button>
        </div>
      )}

      {/* Step 3: Client Info */}
      {step === 3 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-4">3. Tus datos</h3>

          <div className="bg-teal-50 rounded-xl p-4 mb-6">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Servicio</span>
                <p className="font-medium">{selectedService?.name}</p>
              </div>
              <div>
                <span className="text-slate-500">Fecha</span>
                <p className="font-medium">{format(parseISO(selectedDate), "dd/MM/yyyy", { locale: es })}</p>
              </div>
              <div>
                <span className="text-slate-500">Hora</span>
                <p className="font-medium">{selectedTime}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-teal-200">
              <span className="font-bold text-teal-700">{formatCurrency(selectedService?.price || 0)}</span>
            </div>
          </div>

          <form onSubmit={handleClientSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo *</label>
              <input
                type="text"
                value={clientForm.name}
                onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Tu nombre"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono / WhatsApp *</label>
              <input
                type="tel"
                value={clientForm.phone}
                onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="300 123 4567"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={clientForm.email}
                onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="tu@email.com"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 font-medium"
              >
                Atrás
              </button>
              <button
                type="submit"
                className="flex-1 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 font-medium"
              >
                Confirmar Reserva
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
