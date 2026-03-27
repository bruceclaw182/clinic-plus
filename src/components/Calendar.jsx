import { useState, useRef, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO, addWeeks, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAppointments } from '../hooks/useAppointments';
import { useServices } from '../hooks/useAppointments';
import { useClients } from '../hooks/useAppointments';
import { useConfig } from '../hooks/useAppointments';
import AppointmentModal from './AppointmentModal';

export default function Calendar() {
  const [appointments, setAppointments] = useAppointments();
  const [services] = useServices();
  const [clients] = useClients();
  const [config] = useConfig();
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [draggedId, setDraggedId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Reset isDragging when any drag operation ends
  useEffect(() => {
    const handleDragEnd = () => {
      setIsDragging(false);
    };
    window.addEventListener('dragend', handleDragEnd);
    return () => window.removeEventListener('dragend', handleDragEnd);
  }, []);

  const hours = [];
  for (let h = config.startHour; h <= config.endHour; h++) {
    hours.push(h);
  }

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getService = (serviceId) => services.find(s => s.id === serviceId);
  const getClient = (clientId) => clients.find(c => c.id === clientId);

  const getAppointmentsForSlot = (day, hour) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return appointments.filter(apt =>
      apt.date === dateStr &&
      parseInt(apt.time.split(':')[0]) === hour
    );
  };

  const handleSlotClick = (day, hour) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;
    setSelectedDate(dateStr);
    setSelectedTime(timeStr);
    setEditingAppointment(null);
    setModalOpen(true);
  };

  const handleAppointmentClick = (e, apt) => {
    e.stopPropagation();
    if (isDragging) return;
    setEditingAppointment(apt);
    setSelectedDate(apt.date);
    setSelectedTime(apt.time);
    setModalOpen(true);
  };

  const handleDragStart = (e, aptId) => {
    setDraggedId(aptId);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e, day, hour) => {
    e.preventDefault();
    if (!draggedId) return;

    const dateStr = format(day, 'yyyy-MM-dd');
    const timeStr = `${hour.toString().padStart(2, '0')}:00`;

    setAppointments(appointments.map(apt =>
      apt.id === draggedId ? { ...apt, date: dateStr, time: timeStr } : apt
    ));
    setDraggedId(null);
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleCancelAppointment = (id) => {
    setAppointments(appointments.map(apt =>
      apt.id === id ? { ...apt, status: 'cancelled' } : apt
    ));
  };

  const handleCompleteAppointment = (id) => {
    setAppointments(appointments.map(apt =>
      apt.id === id ? { ...apt, status: 'completed' } : apt
    ));
  };

  const today = new Date();

  return (
    <div className="p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setWeekStart(subWeeks(weekStart, 1))}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
          >
            ◀
          </button>
          <h2 className="text-xl font-bold text-slate-800">
            {format(weekStart, 'MMMM yyyy', { locale: es })}
          </h2>
          <button
            onClick={() => setWeekStart(addWeeks(weekStart, 1))}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
          >
            ▶
          </button>
        </div>
        <button
          onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
          className="text-sm text-teal-600 hover:text-teal-800 font-medium"
        >
          Hoy
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="min-w-[700px]">
          {/* Header with days */}
          <div className="grid grid-cols-8 border-b border-slate-200">
            <div className="p-2 text-center text-sm font-medium text-slate-500"></div>
            {days.map((day) => (
              <div
                key={day.toISOString()}
                className={`p-2 text-center border-l border-slate-200 ${
                  isSameDay(day, today) ? 'bg-teal-50' : ''
                }`}
              >
                <div className="text-xs text-slate-500 uppercase">{format(day, 'EEE', { locale: es })}</div>
                <div className={`text-lg font-bold ${isSameDay(day, today) ? 'text-teal-600' : 'text-slate-800'}`}>
                  {format(day, 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* Time slots */}
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-slate-100">
              <div className="p-2 text-right text-xs text-slate-400 pr-3 pt-1">
                {hour.toString().padStart(2, '0')}:00
              </div>
              {days.map((day) => {
                const slotAppts = getAppointmentsForSlot(day, hour);
                return (
                  <div
                    key={day.toISOString()}
                    className={`border-l border-slate-200 p-1 min-h-[60px] cursor-pointer hover:bg-slate-50 transition-colors ${
                      isSameDay(day, today) ? 'bg-teal-50/30' : ''
                    }`}
                    onClick={() => handleSlotClick(day, hour)}
                    onDrop={(e) => handleDrop(e, day, hour)}
                    onDragOver={handleDragOver}
                  >
                    {slotAppts.map((apt) => {
                      const service = getService(apt.serviceId);
                      const client = getClient(apt.clientId);
                      const colorClass = service?.color || 'bg-slate-400';
                      return (
                        <div
                          key={apt.id}
                          draggable="true"
                          onDragStart={(e) => handleDragStart(e, apt.id)}
                          onClick={(e) => handleAppointmentClick(e, apt)}
                          onPointerDown={(e) => e.stopPropagation()}
                          className={`${colorClass} text-white text-xs p-1 rounded mb-1 cursor-pointer select-none ${
                            apt.status === 'cancelled' ? 'opacity-40 line-through' : ''
                          } ${apt.status === 'completed' ? 'opacity-70' : ''}`}
                        >
                          <div className="font-semibold truncate">{service?.name || 'Servicio'}</div>
                          <div className="opacity-80 truncate">{client?.name || 'Cliente'}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {modalOpen && (
        <AppointmentModal
          date={selectedDate}
          time={selectedTime}
          appointment={editingAppointment}
          onClose={() => { setModalOpen(false); setEditingAppointment(null); }}
          onCancel={handleCancelAppointment}
          onComplete={handleCompleteAppointment}
        />
      )}
    </div>
  );
}
