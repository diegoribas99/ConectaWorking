import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, User, Briefcase, Ruler, Users, 
  Building, Package2, Plus, RotateCw, 
  FolderOpen, LineChart, PieChart, Clock, 
  Bot, FileText, Moon, Sun, HelpCircle,
  LogOut, X, CreditCard, Coins, Sparkles
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
    const classes = `flex items-center px-3 py-2.5 text-sm font-medium relative
      ${active || highlight 
        ? 'text-primary font-medium' 
        : 'text-foreground hover:bg-secondary/40'} transition-all duration-200`;
    
    const iconClasses = `transition-transform duration-200 ${active || highlight ? 'text-primary scale-105' : 'text-muted-foreground group-hover:text-foreground'}`;
    
    if (path) {
      return (
        <Link href={path}>
          <div className={`${classes} group`} onClick={onClose}>
            {(active || highlight) && (
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
            )}
            <div className={`relative ${active || highlight ? 'pl-1' : 'pl-0'} transition-all z-10 flex items-center`}>
              <div className="w-5 flex items-center justify-center">
                <span className={iconClasses}>{icon}</span>
              </div>
              <span className="ml-3">{label}</span>
            </div>
          </div>
        </Link>
      );
    }
    
    return (
      <button className={`${classes} group w-full text-left`} onClick={onClick}>
        {(active || highlight) && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
        )}
        <div className={`relative ${active || highlight ? 'pl-1' : 'pl-0'} transition-all z-10 flex items-center`}>
          <div className="w-5 flex items-center justify-center">
            <span className={iconClasses}>{icon}</span>
          </div>
          <span className="ml-3">{label}</span>
        </div>
      </button>
    );
  };

  const SectionHeader = ({ label }: { label: string }) => (
    <div className="flex items-center px-2 py-1.5 mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      <span>{label}</span>
    </div>
  );

  const ModuleHeader = ({ label, icon }: { label: string; icon: React.ReactNode }) => (
    <div className="flex items-center px-3 py-3 mb-4 bg-gradient-to-r from-primary/10 to-transparent rounded-md border-l-2 border-primary">
      <span className="w-5 h-5 text-primary">{icon}</span>
      <span className="ml-3 font-semibold">{label}</span>
    </div>
  );

  return (
    <aside className="flex flex-col w-64 h-full border-r border-border bg-background">
      {/* Company Logo */}
      <div className="h-16 px-6 border-b border-border flex items-center">
        <Link href="/">
          <div className="font-bold text-xl cursor-pointer">
            <span className="text-primary">Conecta</span>Working
          </div>
        </Link>
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
            <MenuItem icon={<User />} label={<span className="flex items-center">Clientes <Sparkles className="h-3 w-3 ml-1.5 text-primary" /></span>} path="/clients-ai" />
            <MenuItem icon={<Building />} label="Projetos" path="/projects" />
            <MenuItem icon={<Building />} label={<span className="flex items-center">Projetos <Sparkles className="h-3 w-3 ml-1.5 text-primary" /></span>} path="/projects-ai" />
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
            <div className="bg-gradient-to-r from-primary/10 to-transparent py-3 px-3 rounded-md mb-3 border-l-2 border-primary">
              <div className="text-sm font-medium flex items-center">
                <HelpCircle className="w-4 h-4 mr-2 text-primary" />
                Ajuda com Precificação
              </div>
              <div className="text-xs text-muted-foreground mt-1 ml-6">Suporte e orientação para seu projeto</div>
            </div>
            <div className="mt-3 space-y-1">
              <MenuItem icon={<Bot />} label="Modo Aprender com IA" path="/learn" />
              <MenuItem icon={<FileText />} label="Exemplos de Propostas" path="/examples" />
              <MenuItem icon={<HelpCircle />} label="Suporte e FAQ" path="/support" />
              <div className="pt-3 mt-3 border-t border-border">
                <MenuItem icon={<LogOut />} label="Sair da Plataforma" path="/logout" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
