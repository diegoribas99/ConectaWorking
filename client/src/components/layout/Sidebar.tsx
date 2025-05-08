import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, User, Briefcase, Ruler, Users, 
  Building, Package2, Plus, RotateCw, 
  FolderOpen, LineChart, PieChart, Clock, 
  Bot, FileText, Moon, Sun, HelpCircle,
  LogOut, X, CreditCard, Coins
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
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
    icon: React.ReactNode; 
    label: string; 
    path?: string;
    highlight?: boolean;
    onClick?: () => void;
  }) => {
    const active = path ? isActive(path) : false;
    const classes = `flex items-center px-2 py-2 text-sm font-medium rounded-md 
      ${active || highlight ? 'bg-secondary text-foreground' : 'text-foreground hover:bg-secondary transition'}`;
    
    const iconClasses = highlight ? 'text-primary' : 'text-muted-foreground';
    
    if (path) {
      return (
        <Link href={path}>
          <a className={classes} onClick={onClose}>
            <span className={`w-5 h-5 ${iconClasses}`}>{icon}</span>
            <span className="ml-3">{label}</span>
          </a>
        </Link>
      );
    }
    
    return (
      <button className={classes} onClick={onClick}>
        <span className={`w-5 h-5 ${iconClasses}`}>{icon}</span>
        <span className="ml-3">{label}</span>
      </button>
    );
  };

  const SectionHeader = ({ label }: { label: string }) => (
    <div className="flex items-center px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
      <span>{label}</span>
    </div>
  );

  const ModuleHeader = ({ label, icon }: { label: string; icon: React.ReactNode }) => (
    <div className="flex items-center px-2 py-2 mb-2 bg-secondary rounded-md">
      <span className="w-5 h-5 text-primary">{icon}</span>
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
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {/* Sidebar Menu */}
      <div className="sidebar-menu flex-1 overflow-y-auto py-4 px-4">
        {/* Block 1: Home */}
        <div className="mb-6">
          <MenuItem icon={<Home />} label="Início" path="/" />
          <MenuItem icon={<User />} label="Meu Perfil" path="/profile" />
        </div>
        
        {/* Block 2: Smart Pricing */}
        <div className="mb-6">
          <ModuleHeader icon={<Coins />} label="Precificação Inteligente" />
          
          {/* Configuration Section */}
          <div className="mb-3">
            <SectionHeader label="Configurações" />
            <MenuItem icon={<Briefcase />} label="Custos do Escritório" path="/office-costs" />
            <MenuItem icon={<Ruler />} label="Valor por m²" path="/sqm-value" />
            <MenuItem icon={<Users />} label="Colaboradores" path="/collaborators" />
            <MenuItem icon={<User />} label="Clientes" path="/clients" />
            <MenuItem icon={<Building />} label="Projetos" path="/projects" />
            <MenuItem icon={<Package2 />} label="Modelos e Pacotes" path="/templates" />
          </div>
          
          {/* Budgets Section */}
          <div className="mb-3">
            <SectionHeader label="Orçamentos" />
            <MenuItem 
              icon={<Plus />} 
              label="Novo Orçamento" 
              path="/budget/new"
              highlight={isActive('/budget/new')}
            />
            <MenuItem icon={<RotateCw />} label="Usar Modelo" path="/budget/template" />
            <MenuItem icon={<FolderOpen />} label="Orçamentos Salvos" path="/budget/saved" />
          </div>
          
          {/* Analysis Section */}
          <div className="mb-3">
            <SectionHeader label="Análises" />
            <MenuItem icon={<LineChart />} label="Comparador Hora × m²" path="/analysis/comparator" />
            <MenuItem icon={<PieChart />} label="Projeção Financeira" path="/analysis/projection" />
            <MenuItem icon={<Clock />} label="Histórico de Margens" path="/analysis/history" />
          </div>
          
          {/* Help Section */}
          <div>
            <SectionHeader label="Ajuda com Precificação" />
            <MenuItem icon={<Bot />} label="Modo Aprender com IA" path="/learn" />
            <MenuItem icon={<FileText />} label="Exemplos de Propostas" path="/examples" />
            <MenuItem icon={<HelpCircle />} label="Suporte e FAQ" path="/support" />
            <MenuItem icon={<LogOut />} label="Sair da Plataforma" path="/logout" />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
