import React from "react";
import {
  FileText,
  Users,
  BarChart3,
  Settings,
  X,
} from "lucide-react";
import Logo from "./Logo";

const Sidebar = ({ activeSection, onSectionChange, open = false, onClose, user }) => {
  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      description: "Visão geral e métricas",
    },
    {
      id: "processos",
      label: "Processos",
      icon: FileText,
      description: "Gerenciar processos judiciais",
    },
    {
      id: "clientes",
      label: "Clientes",
      icon: Users,
      description: "Base de clientes",
    },
    ...(user?.perfil === "admin"
      ? [
          {
            id: "usuarios",
            label: "Usuários",
            icon: Users,
            description: "Gestão de usuários e permissões",
          },
        ]
      : []),
    {
      id: "configuracoes",
      label: "Configurações",
      icon: Settings,
      description: "Preferências do sistema",
    },
  ];

  return (
    <div className={`sidebar ${open ? "open" : ""}`}>
      {/* Header da Sidebar */}
      <div className="sidebar-header">
        <div className="sidebar-mobile-control lg:hidden">
          <button type="button" className="sidebar-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="logo-section">
          <Logo size="sm" />
        </div>
        <p className="sidebar-description">
          Plataforma premium para gestão jurídica inteligente e eficiente.
        </p>
      </div>

      {/* Navegação */}
      <nav className="nav-section">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={() => {
                onSectionChange(item.id);
                onClose?.();
              }}
              title={item.description}
            >
              <Icon className="nav-icon" size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
};

export default Sidebar;
