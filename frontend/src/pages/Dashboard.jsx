import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Sidebar from './Sidebar';
import AssetsTable from './AssetsTable';
import AssetModal from './AssetModal';
import UsersTable from './UsersTable';
import Overview from './Overview'; // <--- Importado correctamente arriba
import { Menu } from 'lucide-react';
import LoansTable from './LoansTable';
import MaintenanceTable from './MaintenanceTable'; // <--- Añade esto arriba
export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]); // <--- Estado para los usuarios
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

  // Cargar datos según la pestaña activa o al iniciar
  useEffect(() => {
    fetchAssets();
    fetchUsers();
  }, []);

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

  const fetchUsers = async () => {
    try {
      const response = await api.get('/usuarios');
      setUsers(response.data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
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

  const handleDeleteAsset = async (id_activo) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este activo?')) {
      try {
        await api.delete(`/activos/${id_activo}`);
        fetchAssets();
      } catch (err) {
        console.error('Error al eliminar activo:', err);
        alert('No se pudo eliminar el activo. Es posible que tenga dependencias.');
      }
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
    <Overview assets={assets} users={users} />
  )}

  {activeTab === 'assets' && (
    <AssetsTable 
      assets={assets} 
      loading={loading} 
      setShowModal={setShowModal} 
      onDelete={handleDeleteAsset}
    />
  )}

  {activeTab === 'users' && (
    <UsersTable />
  )}

  {activeTab === 'loans' && (
    <LoansTable />
  )}

  {/* 👇 AGRÉGALO AQUÍ DENTRO DEL MAIN */}
  {activeTab === 'maintenance' && (
    <MaintenanceTable />
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
  ); // <--- Este es el cierre del return y de la función Dashboard
}