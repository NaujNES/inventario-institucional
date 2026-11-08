import { Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import DashboardPage from "./pages/DashboardPage";

function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard/*" element={<RequireAuth><DashboardPage /></RequireAuth>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}