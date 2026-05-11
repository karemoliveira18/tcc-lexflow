import React from 'react';
import { Bell, Search, User, Menu, LogOut } from 'lucide-react';
import Button from './Button';

const Header = ({ onMenuToggle, userName = "Usuário", onLogout }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="header-title">Painel de Controle</h1>
          <p className="header-subtitle">Gestão Jurídica Inteligente</p>
        </div>

        <div className="header-actions">
          {/* Botão de menu mobile */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="lg:hidden"
            icon={<Menu size={18} />}
          />

          {/* Campo de busca */}
          <div className="relative hidden md:block">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar processos, clientes..."
              className="form-input pl-10 w-64"
            />
          </div>

          {/* Notificações */}
          <Button
            variant="ghost"
            size="sm"
            icon={<Bell size={18} />}
            className="relative"
          >
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* Perfil do usuário */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-200">{userName}</p>
              <p className="text-xs text-slate-400">Online</p>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="ml-2 p-2 hover:bg-slate-700 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut size={16} className="text-slate-400 hover:text-slate-200" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;