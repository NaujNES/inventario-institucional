import React from 'react';
import { Package, Users, LayoutDashboard, ClipboardList, Wrench, LogOut, X } from 'lucide-react';

export default function Sidebar({ sidebarOpen, setSidebarOpen, activeTab, setActiveTab, handleLogout }) {
  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col`}>
      
      {/* Encabezado del Sidebar */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 rounded-lg text-white">
            <Package size={20} />
          </div>
          <span className="font-bold text-lg tracking-wide text-white">InventarioApp</span>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Navegación */}
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        
        {/* Panel General */}
        <button
          onClick={() => setActiveTab('overview')}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'overview' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
              : 'text-slate-400 hover:bg-slate-750 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard size={18} />
          <span>Panel General</span>
        </button>

        {/* Gestión de Activos */}
        <button
          onClick={() => setActiveTab('assets')}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'assets' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
              : 'text-slate-400 hover:bg-slate-750 hover:text-slate-200'
          }`}
        >
          <Package size={18} />
          <span>Gestión de Activos</span>
        </button>

        {/* Usuarios y Roles */}
        <button
          onClick={() => setActiveTab('users')}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'users' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
              : 'text-slate-400 hover:bg-slate-750 hover:text-slate-200'
          }`}
        >
          <Users size={18} />
          <span>Usuarios y Roles</span>
        </button>

        {/* Préstamos */}
        <button
          onClick={() => setActiveTab('loans')}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'loans' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
              : 'text-slate-400 hover:bg-slate-750 hover:text-slate-200'
          }`}
        >
          <ClipboardList size={18} />
          <span>Préstamos</span>
        </button>

        {/* Mantenimientos */}
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
            activeTab === 'maintenance' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
              : 'text-slate-400 hover:bg-slate-750 hover:text-slate-200'
          }`}
        >
          <Wrench size={18} />
          <span>Mantenimientos</span>
        </button>

      </nav>

      {/* Cerrar Sesión */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>

    </aside>
  );
}