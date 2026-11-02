import React from 'react';
import { Package, CheckCircle, AlertTriangle, Users, TrendingUp } from 'lucide-react';

export default function Overview({ assets = [], users = [] }) {
  const totalAssets = assets.length;
  const availableAssets = assets.filter(a => a.estado === 'Disponible').length;
  const maintenanceAssets = assets.filter(a => a.estado === 'Mantenimiento' || a.estado === 'En Uso').length;
  const totalUsers = users.length;

  return (
    <div className="space-y-6 w-full">
      {/* Tarjeta de Bienvenida */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <TrendingUp className="text-indigo-400" /> Panel General de Control
        </h2>
        <p className="text-slate-400 text-sm">
          Bienvenido al sistema de inventario institucional. Resumen en tiempo real del estado de los activos y usuarios registrados en la base de datos.
        </p>
      </div>

      {/* Contenedor Flex optimizado para distribuirse en paralelo */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Total Activos */}
        <div 
          style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: '180px' }} 
          className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex items-center justify-between"
        >
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">Total Activos</p>
            <h3 className="text-2xl font-bold text-white mt-1">{totalAssets}</h3>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Package size={24} />
          </div>
        </div>

        {/* Disponibles */}
        <div 
          style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: '180px' }} 
          className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex items-center justify-between"
        >
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">Disponibles</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">{availableAssets}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <CheckCircle size={24} />
          </div>
        </div>

        {/* En Uso / Mantenimiento */}
        <div 
          style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: '180px' }} 
          className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex items-center justify-between"
        >
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">En Uso / Mant.</p>
            <h3 className="text-2xl font-bold text-amber-400 mt-1">{maintenanceAssets}</h3>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <AlertTriangle size={24} />
          </div>
        </div>

        {/* Usuarios Registrados */}
        <div 
          style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: '180px' }} 
          className="bg-slate-800 border border-slate-700 rounded-xl p-5 shadow-lg flex items-center justify-between"
        >
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-wider font-medium">Usuarios</p>
            <h3 className="text-2xl font-bold text-blue-400 mt-1">{totalUsers}</h3>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Users size={24} />
          </div>
        </div>

      </div>
    </div>
  );
}