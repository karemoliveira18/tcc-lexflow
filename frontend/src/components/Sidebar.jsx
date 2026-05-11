import React from 'react';
import { Scale, FileText, Users, BarChart3, Settings, HelpCircle, Zap } from 'lucide-react';

const Sidebar = ({ activeSection, onSectionChange }) => {
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      description: 'Visão geral e métricas'
    },
    {
      id: 'processos',
      label: 'Processos',
      icon: FileText,
      description: 'Gerenciar processos judiciais'
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: Users,
      description: 'Base de clientes'
    },
    {
      id: 'configuracoes',
      label: 'Configurações',
      icon: Settings,
      description: 'Preferências do sistema'
    }
  ];

  return (
    <div className="sidebar">
      {/* Header da Sidebar */}
      <div className="sidebar-header">
        <div className="logo-section">
          <div className="logo-icon">
            <Scale size={20} />
          </div>
          <div>
            <div className="logo-text">LexFlow</div>
            <div className="logo-subtitle">SaaS Jurídico</div>
          </div>
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
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSectionChange(item.id)}
              title={item.description}
            >
              <Icon className="nav-icon" size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer da Sidebar */}
      <div className="sidebar-footer">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-slate-400" />
          <span className="text-sm font-medium text-slate-200">Premium</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed mb-3">
          Acesso completo a todas as funcionalidades avançadas da plataforma.
        </p>
        <div className="footer-badge">
          <HelpCircle size={12} />
          <span>Suporte 24/7</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;