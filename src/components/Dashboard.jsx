import { useMemo } from 'react';
import { format, startOfDay, startOfWeek, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAppointments } from '../hooks/useAppointments';
import { useServices } from '../hooks/useAppointments';
import { useClients } from '../hooks/useAppointments';
import { formatCurrency } from '../utils/formatCurrency';

export default function Dashboard() {
  const [appointments] = useAppointments();
  const [services] = useServices();
  const [clients] = useClients();

  const today = new Date();

  const stats = useMemo(() => {
    const todayStart = startOfDay(today);
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    const dayApts = appointments.filter(a => a.date === format(today, 'yyyy-MM-dd') && a.status !== 'cancelled');
    const weekApts = appointments.filter(a => {
      const d = parseISO(a.date);
      return isWithinInterval(d, { start: weekStart, end: today }) && a.status !== 'cancelled';
    });
    const monthApts = appointments.filter(a => {
      const d = parseISO(a.date);
      return isWithinInterval(d, { start: monthStart, end: monthEnd }) && a.status !== 'cancelled';
    });

    const dayRevenue = dayApts.reduce((sum, apt) => {
      const service = services.find(s => s.id === apt.serviceId);
      return sum + (service?.price || 0);
    }, 0);

    const weekRevenue = weekApts.reduce((sum, apt) => {
      const service = services.find(s => s.id === apt.serviceId);
      return sum + (service?.price || 0);
    }, 0);

    const monthRevenue = monthApts.reduce((sum, apt) => {
      const service = services.find(s => s.id === apt.serviceId);
      return sum + (service?.price || 0);
    }, 0);

    // Service popularity
    const serviceCount = {};
    appointments.filter(a => a.status !== 'cancelled').forEach(apt => {
      serviceCount[apt.serviceId] = (serviceCount[apt.serviceId] || 0) + 1;
    });
    const topServices = Object.entries(serviceCount)
      .map(([id, count]) => ({ service: services.find(s => s.id === id), count }))
      .filter(s => s.service)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      dayCount: dayApts.length,
      weekCount: weekApts.length,
      monthCount: monthApts.length,
      dayRevenue,
      weekRevenue,
      monthRevenue,
      topServices,
      totalClients: clients.length,
      totalServices: services.length,
    };
  }, [appointments, services, clients, today]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-slate-500">{format(today, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</p>
        </div>
        <div className="bg-teal-600 text-white px-4 py-2 rounded-lg">
          <span className="text-sm opacity-80">Total general</span>
          <div className="text-2xl font-bold">{formatCurrency(stats.monthRevenue)}</div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm">Citas hoy</span>
            <span className="text-2xl">📅</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">{stats.dayCount}</div>
          <div className="text-sm text-teal-600 font-medium mt-1">{formatCurrency(stats.dayRevenue)}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm">Esta semana</span>
            <span className="text-2xl">📆</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">{stats.weekCount}</div>
          <div className="text-sm text-teal-600 font-medium mt-1">{formatCurrency(stats.weekRevenue)}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm">Este mes</span>
            <span className="text-2xl">🗓️</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">{stats.monthCount}</div>
          <div className="text-sm text-teal-600 font-medium mt-1">{formatCurrency(stats.monthRevenue)}</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm">Clientes registrados</span>
            <span className="text-2xl">👥</span>
          </div>
          <div className="text-3xl font-bold text-slate-800">{stats.totalClients}</div>
          <div className="text-sm text-slate-500 mt-1">{stats.totalServices} servicios</div>
        </div>
      </div>

      {/* Charts and Top Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by service */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Servicios más populares</h3>
          {stats.topServices.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p>No hay datos suficientes</p>
              <p className="text-sm">Agrega citas para ver estadísticas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.topServices.map(({ service, count }) => (
                <div key={service.id} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${service.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-700 text-sm">{service.name}</span>
                      <span className="text-xs text-slate-500">{count} cita{count !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${service.color}`}
                        style={{ width: `${(count / stats.topServices[0].count) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Resumen rápido</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-slate-600">Tasa de ocupación (mes)</span>
              <span className="font-bold text-teal-600">
                {stats.monthCount > 0 ? Math.round((stats.monthCount / (stats.totalClients || 1)) * 100) : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-slate-600">Ticket promedio</span>
              <span className="font-bold text-slate-800">
                {stats.monthCount > 0 ? formatCurrency(stats.monthRevenue / stats.monthCount) : '$0'}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-slate-600">Servicios activos</span>
              <span className="font-bold text-slate-800">{stats.totalServices}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-slate-600">Citas completadas (mes)</span>
              <span className="font-bold text-green-600">
                {appointments.filter(a => a.status === 'completed' && a.date.startsWith(format(today, 'yyyy-MM'))).length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
