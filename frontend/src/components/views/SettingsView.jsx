import { useState } from "react";
import { useApp } from "../../hooks/useApp";
import { Save, Sun, Moon, Monitor } from "lucide-react";

export default function SettingsView() {
  const { prefs, setPrefs, showToast } = useApp();
  const [nombre, setNombre] = useState(prefs.institucion);

  const handleSaveName = () => {
    if (!nombre.trim()) return;
    setPrefs({ ...prefs, institucion: nombre });
    showToast("Nombre actualizado", "Se guardó la configuración correctamente.");
  };

  const changeTheme = (theme) => {
    setPrefs({ ...prefs, theme });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="text-sm text-ink-2">Estos ajustes se guardan en este navegador.</p>

      <div className="card divide-y divide-line">
        {/* Tema */}
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-ink">Tema de la aplicación</p>
            <p className="mt-0.5 text-[13px] text-ink-3">Elige claro, oscuro o el que use tu sistema.</p>
          </div>
          <div className="flex bg-subtle border border-line rounded-lg p-1 gap-1">
            <button onClick={() => changeTheme("light")} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${prefs.theme === "light" ? "bg-surface text-ink shadow-sm" : "text-ink-2 hover:text-ink"}`}>
              <Sun size={16} /> Claro
            </button>
            <button onClick={() => changeTheme("dark")} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${prefs.theme === "dark" ? "bg-surface text-ink shadow-sm" : "text-ink-2 hover:text-ink"}`}>
              <Moon size={16} /> Oscuro
            </button>
            <button onClick={() => changeTheme("system")} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${prefs.theme === "system" ? "bg-surface text-ink shadow-sm" : "text-ink-2 hover:text-ink"}`}>
              <Monitor size={16} /> Sistema
            </button>
          </div>
        </div>

        {/* Nombre Institución */}
        <div className="p-5">
          <label className="text-sm font-medium text-ink">Nombre de la institución</label>
          <p className="mt-0.5 text-[13px] text-ink-3">Aparece en el menú lateral izquierdo.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input 
              type="text" 
              className="field sm:max-w-sm" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)} 
              maxLength="60"
            />
            <button onClick={handleSaveName} className="btn btn-secondary">
              <Save size={16} /> Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}