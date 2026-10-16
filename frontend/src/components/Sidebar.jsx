import React from "react";
import {
  FileText,
  Users,
  BarChart3,
  Settings,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import Logo from "./Logo";

const Sidebar = ({ open = false, onClose, user }) => {
  const navigationItems = [
    {
      id: "dashboard",
      to: "/dashboard",
      label: "Dashboard",
      icon: BarChart3,
      description: "Visão geral e métricas",
    },
    {
      id: "processos",
      to: "/processos",
      label: "Processos",
      icon: FileText,
      description: "Gerenciar processos judiciais",
    },
    {
      id: "clientes",
      to: "/clientes",
      label: "Clientes",
      icon: Users,
      description: "Base de clientes",
    },
    ...(user?.perfil === "admin"
      ? [
          {
            id: "usuarios",
            to: "/usuarios",
            label: "Usuários",
            icon: Users,
            description: "Gestão de usuários e permissões",
          },
        ]
      : []),
    {
      id: "configuracoes",
      to: "/configuracoes",
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

          return (
            <NavLink
              key={item.id}
              to={item.to}
              end
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              onClick={onClose}
              title={item.description}
            >
              <Icon className="nav-icon" size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

    </div>
  );
};

export default Sidebar;
