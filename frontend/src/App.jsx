import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import LoginForm from "./components/LoginForm";
import Dashboard from "./pages/Dashboard";
import Processos from "./pages/Processos";
import Clientes from "./pages/Clientes";
import "./styles/globals.css";
import "./styles/dashboard.css";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Verificar se há token salvo no localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    setActiveSection("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    setActiveSection("dashboard");
  };

  if (!isAuthenticated) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return <Dashboard />;
      case "processos":
        return <Processos />;
      case "clientes":
        return <Clientes />;
      case "configuracoes":
        return (
          <div className="content-area">
            <div className="page-header">
              <h1>Configurações</h1>
            </div>
            <div
              style={{
                background: "white",
                padding: "20px",
                borderRadius: "12px",
              }}
            >
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
      <div
        className={`sidebar-backdrop ${sidebarOpen ? "visible" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={user?.nome}
      />

      <div className="main-content">
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          userName={user?.nome}
          onLogout={handleLogout}
        />

        <div className="content-area">{renderContent()}</div>
      </div>
    </div>
  );
}

export default App;
