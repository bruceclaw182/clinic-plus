import { useLocalStorage } from './useLocalStorage';

export const useServices = () => useLocalStorage('clinic-services', []);
export const useClients = () => useLocalStorage('clinic-clients', []);
export const useAppointments = () => useLocalStorage('clinic-appointments', []);
export const useConfig = () => useLocalStorage('clinic-config', {
  clinicName: 'Mi Clínica',
  startHour: 7,
  endHour: 19,
  slotDuration: 30,
});
