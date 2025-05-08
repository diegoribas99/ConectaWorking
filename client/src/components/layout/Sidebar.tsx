import React from 'react';
import { Link, useLocation } from 'wouter';

interface SidebarProps {
  onClose?: () => void;
  onToggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose, onToggleTheme }) => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  const MenuItem = ({ 
    icon, 
    label, 
    path, 
    highlight = false,
    onClick
  }: { 
    icon: string; 
    label: string; 
    path?: string;
    highlight?: boolean;
    onClick?: () => void;
  }) => {
    const active = path ? isActive(path) : false;
    const classes = `flex items-center px-2 py-2 text-sm font-medium rounded-md 
      ${active || highlight ? 'bg-secondary text-foreground' : 'text-foreground hover:bg-secondary transition'}`;
    
    if (path) {
      return (
        <Link href={path}>
          <a className={classes} onClick={onClose}>
            <i className={`${icon} w-5 ${highlight ? 'text-primary' : 'text-muted-foreground'}`}></i>
            <span className="ml-3">{label}</span>
          </a>
        </Link>
      );
    }
    
    return (
      <button className={classes} onClick={onClick}>
        <i className={`${icon} w-5 ${highlight ? 'text-primary' : 'text-muted-foreground'}`}></i>
        <span className="ml-3">{label}</span>
      </button>
    );
  };

  const SectionHeader = ({ label }: { label: string }) => (
    <div className="flex items-center px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
      <span>{label}</span>
    </div>
  );

  const ModuleHeader = ({ label, icon }: { label: string; icon: string }) => (
    <div className="flex items-center px-2 py-2 mb-2 bg-secondary rounded-md">
      <i className={`${icon} w-5 text-primary`}></i>
      <span className="ml-3 font-medium">{label}</span>
    </div>
  );

  return (
    <aside className="flex flex-col w-64 h-full border-r border-border bg-background">
      {/* Company Logo */}
      <div className="px-6 py-5 border-b border-border flex items-center">
        <div className="font-bold text-xl">
          <span className="text-primary">Conecta</span>Working
        </div>
        {onClose && (
          <button 
            className="ml-auto text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        )}
      </div>
      
      {/* Sidebar Menu */}
      <div className="sidebar-menu flex-1 overflow-y-auto py-4 px-4">
        {/* Block 1: Home */}
        <div className="mb-6">
          <MenuItem icon="fa-solid fa-house" label="Início" path="/" />
          <MenuItem icon="fa-solid fa-user" label="Meu Perfil" path="/profile" />
        </div>
        
        {/* Block 2: Smart Pricing */}
        <div className="mb-6">
          <ModuleHeader icon="fa-solid fa-coins" label="Precificação Inteligente" />
          
          {/* Configuration Section */}
          <div className="mb-3">
            <SectionHeader label="Configurações" />
            <MenuItem icon="fa-solid fa-briefcase" label="Custos do Escritório" path="/office-costs" />
            <MenuItem icon="fa-solid fa-ruler" label="Valor por m²" path="/sqm-value" />
            <MenuItem icon="fa-solid fa-users" label="Colaboradores" path="/collaborators" />
            <MenuItem icon="fa-solid fa-user-tie" label="Clientes" path="/clients" />
            <MenuItem icon="fa-solid fa-building" label="Projetos" path="/projects" />
            <MenuItem icon="fa-solid fa-toolbox" label="Modelos e Pacotes" path="/templates" />
          </div>
          
          {/* Budgets Section */}
          <div className="mb-3">
            <SectionHeader label="Orçamentos" />
            <MenuItem 
              icon="fa-solid fa-plus" 
              label="Novo Orçamento" 
              path="/budget/new"
              highlight={isActive('/budget/new')}
            />
            <MenuItem icon="fa-solid fa-rotate" label="Usar Modelo" path="/budget/template" />
            <MenuItem icon="fa-solid fa-folder" label="Orçamentos Salvos" path="/budget/saved" />
          </div>
          
          {/* Analysis Section */}
          <div className="mb-3">
            <SectionHeader label="Análises" />
            <MenuItem icon="fa-solid fa-chart-line" label="Comparador Hora × m²" path="/analysis/comparator" />
            <MenuItem icon="fa-solid fa-chart-pie" label="Projeção Financeira" path="/analysis/projection" />
            <MenuItem icon="fa-solid fa-clock-rotate-left" label="Histórico de Margens" path="/analysis/history" />
          </div>
          
          {/* Help Section */}
          <div>
            <SectionHeader label="Ajuda com Precificação" />
            <MenuItem icon="fa-solid fa-robot" label="Modo Aprender com IA" path="/learn" />
            <MenuItem icon="fa-solid fa-file-lines" label="Exemplos de Propostas" path="/examples" />
          </div>
        </div>
      </div>
      
      {/* Footer Menu */}
      <div className="mt-auto p-4 border-t border-border">
        <MenuItem 
          icon="fa-solid fa-moon dark:hidden" 
          label="Modo Escuro"
          onClick={onToggleTheme} 
        />
        <MenuItem 
          icon="fa-solid fa-sun hidden dark:inline-block" 
          label="Modo Claro"
          onClick={onToggleTheme} 
        />
        <MenuItem icon="fa-solid fa-circle-question" label="Suporte e FAQ" path="/support" />
        <MenuItem icon="fa-solid fa-right-from-bracket" label="Sair" path="/logout" />
      </div>
    </aside>
  );
};

export default Sidebar;
