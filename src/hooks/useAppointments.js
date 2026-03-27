import { useState, useEffect, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

// Custom event name for cross-component sync
const STORAGE_SYNC_EVENT = 'clinic-data-sync';

// Hook that always reads fresh from localStorage and syncs across components
const useSyncedLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Force re-render when storage changes (fires for OTHER tabs/windows)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key) {
        try {
          const item = window.localStorage.getItem(key);
          setStoredValue(item ? JSON.parse(item) : initialValue);
        } catch (error) {
          console.error(`Error syncing localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  // Listen for custom sync event (fires for SAME tab updates)
  useEffect(() => {
    const handleSyncEvent = (e) => {
      if (e.detail?.key === key) {
        try {
          const item = window.localStorage.getItem(key);
          setStoredValue(item ? JSON.parse(item) : initialValue);
        } catch (error) {
          console.error(`Error syncing localStorage key "${key}":`, error);
        }
      }
    };

    window.addEventListener(STORAGE_SYNC_EVENT, handleSyncEvent);
    return () => window.removeEventListener(STORAGE_SYNC_EVENT, handleSyncEvent);
  }, [key, initialValue]);

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      // Dispatch custom event to notify other components in same tab
      window.dispatchEvent(new CustomEvent(STORAGE_SYNC_EVENT, {
        detail: { key }
      }));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

// Original hooks (now using synced version)
export const useServices = () => useSyncedLocalStorage('clinic-services', []);
export const useClients = () => useSyncedLocalStorage('clinic-clients', []);
export const useAppointments = () => useSyncedLocalStorage('clinic-appointments', []);
export const useConfig = () => useSyncedLocalStorage('clinic-config', {
  clinicName: 'Mi Clínica',
  startHour: 7,
  endHour: 19,
  slotDuration: 30,
});
