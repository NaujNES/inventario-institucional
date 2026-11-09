import React, { useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import Toasts from "../components/ui/Toasts";
import DashboardView from "../components/views/DashboardView";
import InventoryView from "../components/views/InventoryView";
import CategoriesView from "../components/views/CategoriesView";
import LocationsView from "../components/views/LocationsView";
import ReportsView from "../components/views/ReportsView";
import SettingsView from "../components/views/SettingsView";
import UsersView from "../components/views/UsersView";
import LoansView from "../components/views/LoansView";
import MaintenanceView from "../components/views/MaintenanceView";
import DocentesView from "../components/views/DocentesView";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Determinar el título de la página según la URL
  const getPageTitle = () => {
    if (location.pathname.includes("inventario")) return "Inventario de activos";
    if (location.pathname.includes("categorias")) return "Categorías";
    if (location.pathname.includes("ubicaciones")) return "Salas y espacios";
    if (location.pathname.includes("docentes")) return "Docentes responsables";
    if (location.pathname.includes("reportes")) return "Reportes";
    if (location.pathname.includes("configuracion")) return "Configuración";
    if (location.pathname.includes("usuarios")) return "Gestión de Usuarios";
    if (location.pathname.includes("prestamos")) return "Gestión de Préstamos";
    if (location.pathname.includes("mantenimientos")) return "Mantenimientos";
    return "Dashboard";
  };

  return (
    <div className="min-h-screen bg-canvas font-sans text-sm text-ink antialiased">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-60 flex flex-col min-h-screen">
        <Header onOpenSidebar={() => setSidebarOpen(true)} title={getPageTitle()} />
        
        <main className="flex-1 mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Routes>
            <Route path="usuarios" element={<UsersView />} />
            <Route path="/" element={<DashboardView />} />
            <Route path="inventario" element={<InventoryView />} />
            <Route path="categorias" element={<CategoriesView />} />
            <Route path="ubicaciones" element={<LocationsView />} />
            <Route path="docentes" element={<DocentesView />} />
            <Route path="reportes" element={<ReportsView />} />
            <Route path="configuracion" element={<SettingsView />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            <Route path="prestamos" element={<LoansView />} />
            <Route path="mantenimientos" element={<MaintenanceView />} />
          </Routes>
        </main>
      </div>

      <Toasts />
    </div>
  );
}