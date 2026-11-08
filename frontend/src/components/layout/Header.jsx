import React from "react";
import { Menu, Search, Moon, Sun, User, LogOut } from "lucide-react";
import { useApp } from "../../hooks/useApp";
import { useNavigate } from "react-router-dom";

export default function Header({ onOpenSidebar, title }) {
  const { prefs, setPrefs } = useApp();
  const navigate = useNavigate();

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    setPrefs({ ...prefs, theme: isDark ? "light" : "dark" });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/80 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button onClick={onOpenSidebar} className="lg:hidden icon-btn -ml-1.5 text-ink-3">
          <Menu size={20} />
        </button>
        
        <h1 className="whitespace-nowrap text-[15px] font-semibold tracking-tight text-ink">
          {title}
        </h1>

        <div className="mx-auto w-full max-w-md hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
            <input 
              type="text" 
              className="w-full h-9 pl-9 pr-4 rounded-lg border border-line-strong bg-surface text-sm text-ink focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20" 
              placeholder="Buscar activos..." 
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button onClick={toggleTheme} className="icon-btn text-ink-3 hover:bg-subtle" title="Cambiar tema">
            <Moon size={18} className="dark:hidden" />
            <Sun size={18} className="hidden dark:block" />
          </button>
          <span className="mx-1 hidden h-6 w-px bg-line sm:block"></span>
          <button onClick={handleLogout} className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-subtle text-ink-2">
            <div className="size-8 rounded-full bg-accent-soft text-accent-fg grid place-items-center font-semibold text-xs">
              <User size={16} />
            </div>
            <span className="hidden sm:block text-sm font-medium">Cerrar Sesión</span>
            <LogOut size={16} className="hidden sm:block text-ink-3" />
          </button>
        </div>
      </div>
    </header>
  );
}