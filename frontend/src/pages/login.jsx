import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { Lock, User, LogIn, AlertCircle } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await api.post("/token", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      localStorage.setItem("token", response.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError("Documento o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 font-sans">
      <div className="max-w-md w-full bg-surface rounded-2xl shadow-pop p-8 border border-line">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-accent-soft text-accent-fg rounded-xl mb-4">
            <LogIn size={32} />
          </div>
          <h2 className="text-2xl font-semibold text-ink tracking-tight">Inventario Institucional</h2>
          <p className="text-ink-3 text-sm mt-1">Inicia sesión para acceder al sistema</p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Usuario / Documento</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-ink-3">
                <User size={18} />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="field pl-10"
                placeholder="Ingresa tu documento"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Contraseña</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-ink-3">
                <Lock size={18} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field pl-10"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full h-11 text-[15px]"
          >
            {loading ? "Verificando..." : "Ingresar al Sistema"}
          </button>
        </form>
      </div>
    </div>
  );
}