import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from './Sidebar';               // <--- Apunta a la misma carpeta pages
import AssetsTable from './AssetsTable';       // <--- Apunta a la misma carpeta pages
import AssetModal from './AssetModal';         // <--- Apunta a la misma carpeta pages
import { Menu, ShieldCheck, Package } from 'lucide-react';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formError, setFormError] = useState('');
  
  const [newAsset, setNewAsset] = useState({
    codigo_unico: '',
    nombre_activo: '',
    descripcion: '',
    estado: 'Disponible',
    id_clase: 1,
    id_ubicacion: 1,
    fecha_adquisicion: new Date().toISOString()
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    if (activeTab === 'assets') {
      fetchAssets();
    }
  }, [activeTab]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/activos/');
      setAssets(response.data);
    } catch (err) {
      console.error('Error al cargar activos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAsset = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await api.post('/activos/', newAsset);
      setShowModal(false);
      setNewAsset({
        codigo_unico: '',
        nombre_activo: '',
        descripcion: '',
        estado: 'Disponible',
        id_clase: 1,
        id_ubicacion: 1,
        fecha_adquisicion: new Date().toISOString()
      });
      fetchAssets();
    } catch (err) {
      console.error('Error al crear activo:', err);
      setFormError('No se pudo registrar el activo. Verifica los datos y las llaves foráneas.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        handleLogout={handleLogout} 
      />

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-slate-800/50 backdrop-blur border-b border-slate-700 flex items-center justify-between px-6 sticky top-0 z-40">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden text-slate-400 hover:text-white">
            <Menu size={22} />
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-400">Sesión Activa</span>
            <span className="h-2.5 w-2.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
          </div>
        </header>

        <main className="p-6 flex-1 bg-slate-900">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white">¡Bienvenido al Sistema de Inventario! 🚀</h1>
                <p className="text-slate-400 text-sm mt-1">Estructura modular implementada exitosamente.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400 font-medium">Módulo Activo</p>
                      <h3 className="text-2xl font-bold text-white mt-1">Inventario</h3>
                    </div>
                    <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
                      <Package size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400 font-medium">Conexión Backend</p>
                      <h3 className="text-2xl font-bold text-emerald-400 mt-1">Conectado</h3>
                    </div>
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
                      <ShieldCheck size={24} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'assets' && (
            <AssetsTable 
              assets={assets} 
              loading={loading} 
              setShowModal={setShowModal} 
            />
          )}

          {activeTab === 'users' && (
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Usuarios y Roles</h1>
              <p className="text-slate-400 text-sm">Control de permisos y usuarios registrados en la plataforma.</p>
            </div>
          )}
        </main>
      </div>

      <AssetModal 
        showModal={showModal} 
        setShowModal={setShowModal} 
        newAsset={newAsset} 
        setNewAsset={setNewAsset} 
        handleCreateAsset={handleCreateAsset} 
        formError={formError} 
      />
    </div>
  );
}