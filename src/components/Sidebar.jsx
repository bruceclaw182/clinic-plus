import { useState } from 'react';

const views = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'calendar', label: 'Agenda', icon: '📅' },
  { id: 'services', label: 'Servicios', icon: '💆' },
  { id: 'clients', label: 'Clientes', icon: '👥' },
  { id: 'booking', label: 'Reservar', icon: '🌐' },
];

export default function Sidebar({ currentView, onViewChange }) {
  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-teal-400">Clínica+</h1>
        <p className="text-slate-400 text-sm mt-1">Sistema de citas</p>
      </div>
      <nav className="flex-1">
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 text-left transition-colors ${
              currentView === view.id
                ? 'bg-teal-600 text-white'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span className="text-xl">{view.icon}</span>
            <span className="font-medium">{view.label}</span>
          </button>
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-slate-700">
        <div className="text-xs text-slate-500 text-center">
          Powered by Clínica+
        </div>
      </div>
    </aside>
  );
}
