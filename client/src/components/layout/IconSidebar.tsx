import React from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, User, Briefcase, Ruler, Users, 
  Building, Package2, Plus, RotateCw, 
  FolderOpen, LineChart, PieChart, Clock, 
  Bot, FileText, HelpCircle, LogOut, Coins
} from 'lucide-react';
import { useTheme } from '@/lib/theme';

const IconSidebar: React.FC = () => {
  const [location] = useLocation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const isActive = (path: string) => {
    return location === path;
  };

  const IconMenuItem = ({ 
    icon, 
    path, 
    label,
    highlight = false 
  }: { 
    icon: React.ReactNode; 
    path: string;
    label: string;
    highlight?: boolean;
  }) => {
    const active = isActive(path);
    
    return (
      <Link href={path}>
        <div className="relative group">
          <div 
            className={`flex items-center justify-center h-12 w-12 mx-auto my-2 transition-all duration-200
              ${active || highlight 
                ? 'text-primary scale-110' 
                : 'text-muted-foreground hover:text-foreground hover:scale-105'}`}
            title={label}
          >
            {icon}
          </div>
          {(active || highlight) && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
          )}
        </div>
      </Link>
    );
  };

  return (
    <aside className="flex flex-col w-16 h-full border-r border-border bg-background">
      {/* Minimal Logo */}
      <div className="h-16 px-2 border-b border-border flex items-center justify-center">
        <Link href="/">
          <div className="font-bold text-xl cursor-pointer text-primary">
            CW
          </div>
        </Link>
      </div>
      
      {/* Icon Menu */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* Main Nav */}
        <div className="mb-6 flex flex-col items-center">
          <IconMenuItem icon={<Home />} label="Início" path="/" />
          <IconMenuItem icon={<User />} label="Meu Perfil" path="/profile" />
          <IconMenuItem icon={<Users />} label="Comunidade" path="/comunidade" />
        </div>
        
        {/* Divider */}
        <div className="border-t border-border/50 my-2 mx-3"></div>
        
        {/* Core Features */}
        <div className="mb-6 flex flex-col items-center">
          <IconMenuItem icon={<Briefcase />} label="Custos do Escritório" path="/office-costs" />
          <IconMenuItem icon={<Users />} label="Colaboradores" path="/collaborators" />
          <IconMenuItem icon={<User />} label="Clientes" path="/clients" />
          <IconMenuItem icon={<Building />} label="Projetos" path="/projects" />
          <IconMenuItem icon={<Package2 />} label="Modelos e Pacotes" path="/templates" />
        </div>
        
        {/* Divider */}
        <div className="border-t border-border/50 my-2 mx-3"></div>
        
        {/* Budget */}
        <div className="mb-6 flex flex-col items-center">
          <IconMenuItem 
            icon={<Plus />} 
            label="Novo Orçamento" 
            path="/budget/new"
            highlight={isActive('/budget/new')}
          />
          <IconMenuItem icon={<FolderOpen />} label="Orçamentos Salvos" path="/budget/saved" />
        </div>
        
        {/* Divider */}
        <div className="border-t border-border/50 my-2 mx-3"></div>
        
        {/* Help */}
        <div className="flex flex-col items-center">
          <IconMenuItem icon={<Bot />} label="Modo Aprender com IA" path="/learn" />
          <IconMenuItem icon={<HelpCircle />} label="Suporte" path="/support" />
          <IconMenuItem icon={<LogOut />} label="Sair" path="/logout" />
        </div>
      </div>
    </aside>
  );
};

export default IconSidebar;