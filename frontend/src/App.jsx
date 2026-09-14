import React, { useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import LoginForm from "./components/LoginForm";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Processos from "./pages/Processos";
import Clientes from "./pages/Clientes";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import Usuarios from "./pages/Usuarios";
import "./styles/globals.css";
import "./styles/dashboard.css";

function AppLayout({ user, onLogout, setSidebarOpen, sidebarOpen, activeSection, setActiveSection }) {
  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "processos":
        return <Processos />;
      case "clientes":
        return <Clientes />;
      case "usuarios":
        return <Usuarios />;
      case "configuracoes":
        return (
          <div className="content-area">
            <div className="page-header">
              <h1>Configurações</h1>
            </div>
            <div className="settings-placeholder">
              <p>Módulo de configurações em desenvolvimento.</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <div className={`sidebar-backdrop ${sidebarOpen ? "visible" : ""}`} onClick={() => setSidebarOpen(false)} />
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={user?.nome}
        user={user}
      />

      <div className="main-content">
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          userName={user?.nome}
          onLogout={onLogout}
        />

        <div className="content-area">{renderContent()}</div>
      </div>
    </div>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const { user, isAuthenticated, isInitializing, login, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const handleLoginSuccess = async (userData) => {
    login(userData);
    const from = new URLSearchParams(location.search).get("redirect") || location.state?.from || "/dashboard";
    navigate(from, { replace: true });
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <Routes>
      <Route path="/" element={<Landing isAuthenticated={isAuthenticated} />} />
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to={new URLSearchParams(location.search).get("redirect") || "/dashboard"} replace />
            : <LoginForm onLoginSuccess={handleLoginSuccess} />
        }
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} user={user} isInitializing={isInitializing}>
            <AppLayout
              user={user}
              onLogout={handleLogout}
              setSidebarOpen={setSidebarOpen}
              sidebarOpen={sidebarOpen}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/clientes"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} user={user} isInitializing={isInitializing}>
            <AppLayout
              user={user}
              onLogout={handleLogout}
              setSidebarOpen={setSidebarOpen}
              sidebarOpen={sidebarOpen}
              activeSection="clientes"
              setActiveSection={setActiveSection}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/processos"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} user={user} isInitializing={isInitializing}>
            <AppLayout
              user={user}
              onLogout={handleLogout}
              setSidebarOpen={setSidebarOpen}
              sidebarOpen={sidebarOpen}
              activeSection="processos"
              setActiveSection={setActiveSection}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/configuracoes"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} user={user} isInitializing={isInitializing}>
            <AppLayout
              user={user}
              onLogout={handleLogout}
              setSidebarOpen={setSidebarOpen}
              sidebarOpen={sidebarOpen}
              activeSection="configuracoes"
              setActiveSection={setActiveSection}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/usuarios"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated} user={user} isInitializing={isInitializing} requiredProfile="admin">
            <AppLayout
              user={user}
              onLogout={handleLogout}
              setSidebarOpen={setSidebarOpen}
              sidebarOpen={sidebarOpen}
              activeSection="usuarios"
              setActiveSection={setActiveSection}
            />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound isAuthenticated={isAuthenticated} />} />
    </Routes>
  );
}

export default App;
