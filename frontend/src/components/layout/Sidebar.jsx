import React from "react";
import { NavLink } from "react-router-dom";
import { useApp } from "../../hooks/useApp";
import { LayoutDashboard, Package, Tags, MapPin, ChartColumn, Settings, Boxes, X, Users, ClipboardList, Wrench, UserRound } from "lucide-react";
import { nf } from "../../utils/helpers";

export default function Sidebar({ isOpen, onClose }) {
  // Asegúrate de que esta línea de abajo esté así de completa:
  const { assets, categories, locations, users, prefs, loans, maintenances, docentes } = useApp();
  
  // ... (el resto de tu código)
  const links = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/dashboard/inventario", icon: Package, label: "Inventario", count: assets.length },
    { to: "/dashboard/categorias", icon: Tags, label: "Categorías", count: categories.length },
    { to: "/dashboard/ubicaciones", icon: MapPin, label: "Salas y espacios", count: locations.length },
    { to: "/dashboard/docentes", icon: UserRound, label: "Docentes", count: docentes.length },
    { to: "/dashboard/reportes", icon: ChartColumn, label: "Reportes" },
    { to: "/dashboard/usuarios", icon: Users, label: "Usuarios", count: users.length },
    { to: "/dashboard/prestamos", icon: ClipboardList, label: "Préstamos", count: loans.length },
    { to: "/dashboard/mantenimientos", icon: Wrench, label: "Mantenimientos", count: maintenances.length },
];

  return (
    <>
      {/* Fondo oscuro para móvil */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-line bg-surface transition-transform duration-200 ease-out lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 flex-none items-center gap-3 border-b border-line px-4">
          <div className="grid size-8 flex-none place-items-center rounded-lg bg-ink text-surface shadow-sm">
            <Boxes className="h-4 w-4" />
          </div>
          <div className="min-w-0 leading-tight flex-1">
            <p className="truncate text-sm font-semibold tracking-tight text-ink">{prefs.institucion}</p>
            <p className="text-xs text-ink-3">Inventario institucional</p>
          </div>
          <button onClick={onClose} className="lg:hidden text-ink-3 hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `nav-item ${isActive ? "bg-subtle text-ink" : "text-ink-2 hover:bg-subtle hover:text-ink"}`
              }
              onClick={() => { if (window.innerWidth < 1024) onClose(); }}
            >
              <link.icon size={16} className="text-ink-3" />
              <span className="flex-1">{link.label}</span>
              {link.count !== undefined && (
                <span className="text-xs font-normal text-ink-3">{nf.format(link.count)}</span>
              )}
            </NavLink>
          ))}
          <div className="my-3 border-t border-line" />
          <NavLink
            to="/dashboard/configuracion"
            className={({ isActive }) =>
              `nav-item ${isActive ? "bg-subtle text-ink" : "text-ink-2 hover:bg-subtle hover:text-ink"}`
            }
            onClick={() => { if (window.innerWidth < 1024) onClose(); }}
          >
            <Settings size={16} className="text-ink-3" />
            <span>Configuración</span>
          </NavLink>
        </nav>
      </aside>
    </>
  );
}