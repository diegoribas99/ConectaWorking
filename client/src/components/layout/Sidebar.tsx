import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, User, Briefcase, Ruler, Users, 
  Building, Package2, Plus, RotateCw, 
  FolderOpen, LineChart, PieChart, Clock, 
  Bot, FileText, Moon, Sun, HelpCircle,
  LogOut, X, CreditCard, Coins, Sparkles,
  Trophy, BookOpen, Layout, ChevronDown, ChevronRight,
  Image, Video, MessageSquare, GraduationCap, Award, Star,
  Play, Bookmark, ListMusic
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SidebarProps {
  onClose?: () => void;
  collapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose, collapsed }) => {
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
    label: React.ReactNode; 
    path?: string;
    highlight?: boolean;
    onClick?: () => void;
  }) => {
    const active = path ? isActive(path) : false;
    const classes = `flex items-center px-3 py-2 my-0.5 text-sm font-medium relative rounded-md
      ${active || highlight 
        ? 'text-primary font-medium bg-primary/5' 
        : 'text-foreground hover:bg-secondary/30'} transition-all duration-200`;
    
    const iconClasses = `transition-transform duration-200 ${active || highlight ? 'text-primary scale-105' : 'text-muted-foreground group-hover:text-foreground'}`;
    
    if (path) {
      return (
        <Link href={path}>
          <div className={`${classes} group`} onClick={onClose}>
            {(active || highlight) && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-3/5 w-1 bg-primary rounded-full" />
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
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-3/5 w-1 bg-primary rounded-full" />
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
    <div className="flex items-center px-3 py-1.5 mb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      <span>{label}</span>
    </div>
  );
  
  // Submenu com dropdown para itens do menu
  const SubMenu = ({ 
    icon, 
    label, 
    children,
    defaultOpen = false
  }: { 
    icon: React.ReactNode; 
    label: React.ReactNode; 
    children: React.ReactNode;
    defaultOpen?: boolean;
  }) => {
    const [open, setOpen] = useState(defaultOpen);
    
    return (
      <Collapsible
        open={open}
        onOpenChange={setOpen}
        className="w-full"
      >
        <CollapsibleTrigger asChild>
          <button 
            className="flex items-center px-3 py-2 my-0.5 text-sm font-medium relative rounded-md w-full text-foreground hover:bg-secondary/30 transition-all duration-200 group"
          >
            <div className="w-5 flex items-center justify-center">
              <span className="text-muted-foreground group-hover:text-foreground">{icon}</span>
            </div>
            <span className="ml-3 flex-1">{label}</span>
            <div className="text-muted-foreground">
              {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-9 pr-2 overflow-hidden">
          {children}
        </CollapsibleContent>
      </Collapsible>
    );
  };

  // Item de submenu para uso dentro de SubMenu
  const SubMenuItem = ({ 
    label,
    path, 
    highlight = false,
    icon
  }: { 
    label: React.ReactNode;
    path?: string;
    highlight?: boolean;
    icon?: React.ReactNode;
  }) => {
    const active = path ? isActive(path) : false;
    const classes = `flex items-center py-2 px-2 my-0.5 text-sm relative rounded-md
      ${active || highlight 
        ? 'text-primary font-medium bg-primary/5' 
        : 'text-foreground hover:bg-secondary/30'} transition-all duration-200`;
    
    if (path) {
      return (
        <Link href={path}>
          <div className={`${classes} group`} onClick={onClose}>
            {(active || highlight) && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-3/5 w-1 bg-primary rounded-full" />
            )}
            <div className="flex items-center">
              {icon && (
                <div className="w-4 h-4 mr-2">
                  {icon}
                </div>
              )}
              <span>{label}</span>
            </div>
          </div>
        </Link>
      );
    }
    
    return (
      <div className={classes}>
        {icon && (
          <div className="w-4 h-4 mr-2">
            {icon}
          </div>
        )}
        <span>{label}</span>
      </div>
    );
  };

  const ModuleHeader = ({ label, icon }: { label: string; icon: React.ReactNode }) => (
    <div className="flex items-center px-4 py-3 mb-4 bg-gradient-to-r from-primary/10 to-transparent rounded-md border-l-2 border-primary shadow-sm">
      <span className="w-5 h-5 text-primary">{icon}</span>
      <span className="ml-3 font-semibold">{label}</span>
    </div>
  );

  // Para o modo collapsed, vamos modificar o componente MenuItem
  const CollapsedMenuItem = ({ 
    icon, 
    path, 
    highlight = false,
    onClick
  }: { 
    icon: React.ReactNode; 
    path?: string;
    highlight?: boolean;
    onClick?: () => void;
  }) => {
    const active = path ? isActive(path) : false;
    const classes = `flex items-center justify-center py-2.5 my-1 relative rounded-md mx-2
      ${active || highlight 
        ? 'bg-primary/10 text-primary' 
        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'} transition-all duration-200`;
    
    const iconClasses = `transition-transform duration-200 ${active || highlight ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-foreground'}`;
    
    if (path) {
      return (
        <Link href={path}>
          <div className={`${classes} group`} onClick={onClose}>
            {(active || highlight) && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 bottom-auto h-3/5 w-1 bg-primary rounded-full" />
            )}
            <div className="w-10 h-10 flex items-center justify-center">
              <span className={iconClasses}>{icon}</span>
            </div>
          </div>
        </Link>
      );
    }
    
    return (
      <button className={`${classes} group w-full`} onClick={onClick}>
        {(active || highlight) && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 bottom-auto h-3/5 w-1 bg-primary rounded-full" />
        )}
        <div className="w-10 h-10 flex items-center justify-center">
          <span className={iconClasses}>{icon}</span>
        </div>
      </button>
    );
  };

  // Componente de separador para o modo collapsed
  const CollapsedSeparator = () => (
    <div className="w-8 mx-auto h-px bg-border/60 my-4" />
  );

  // Dados simulados do usuário atual
  const currentUser = {
    name: "Ana Silva",
    email: "ana.silva@gmail.com",
    avatar: "", // URL da imagem de avatar 
    initials: "AS",
    plan: "Premium" // ou "Básico", "Profissional", etc.
  };
  
  return (
    <aside className={`flex flex-col h-full border-r border-border/40 bg-background shadow-sm ${collapsed ? 'w-[70px]' : 'w-64'}`}>
      {/* Company Logo */}
      <div className="h-16 px-3 border-b border-border/40 flex items-center justify-center bg-primary/5">
        {!collapsed ? (
          <Link href="/">
            <div className="font-bold text-xl cursor-pointer transition-all hover:scale-105">
              <span className="text-primary">Conecta</span>Working
            </div>
          </Link>
        ) : (
          <Link href="/">
            <div className="font-bold text-xl cursor-pointer transition-all hover:scale-105">
              <span className="text-primary">C</span>W
            </div>
          </Link>
        )}
        {onClose && !collapsed && (
          <button 
            className="ml-auto text-muted-foreground hover:text-primary transition-colors"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      {/* User Profile Section */}
      {!collapsed ? (
        <div className="border-b border-border/40 py-4 px-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarImage src={currentUser.avatar} />
              <AvatarFallback className="bg-primary/10 text-primary">{currentUser.initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{currentUser.name}</span>
              <Badge variant="outline" className="mt-1 h-5 px-2 bg-primary/10 text-primary text-xs">
                Plano {currentUser.plan}
              </Badge>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-b border-border/40 py-3 flex justify-center">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src={currentUser.avatar} />
            <AvatarFallback className="bg-primary/10 text-primary">{currentUser.initials}</AvatarFallback>
          </Avatar>
        </div>
      )}
      
      {/* Sidebar Menu - Collapsed or Full */}
      {collapsed ? (
        <div className="sidebar-menu flex-1 overflow-y-auto py-4">
          <div className="flex flex-col items-center space-y-1">
            <CollapsedMenuItem icon={<Home />} path="/" />
            <CollapsedMenuItem icon={<User />} path="/profile" />
            <CollapsedMenuItem icon={<Trophy />} path="/gamification" />
            <CollapsedMenuItem icon={<Users />} path="/comunidade" />
            <CollapsedMenuItem icon={<GraduationCap />} path="/cursos" />
            <CollapsedMenuItem icon={<Star />} path="/conectapremium" />
            <CollapsedMenuItem icon={<Image />} path="/image-editor" />
            <CollapsedMenuItem icon={<Video />} path="/videoconferencia" />
            <CollapsedMenuItem icon={<FileText />} path="/videoconferencia/1" />
            <CollapsedMenuItem icon={<BookOpen />} path="/blog" />
            <CollapsedMenuItem icon={<Layout />} path="/blog/admin/post/novo" />
            
            <CollapsedSeparator />
            
            <CollapsedMenuItem icon={<Briefcase />} path="/office-costs" />
            <CollapsedMenuItem icon={<Ruler />} path="/sqm-value" />
            <CollapsedMenuItem icon={<Users />} path="/collaborators" />
            <CollapsedMenuItem icon={<User />} path="/clients" />
            <CollapsedMenuItem icon={<Building />} path="/projects" />
            <CollapsedMenuItem icon={<Package2 />} path="/templates" />
            
            <CollapsedSeparator />
            
            <CollapsedMenuItem icon={<Plus />} path="/budget/new" highlight={isActive('/budget/new')} />
            <CollapsedMenuItem icon={<RotateCw />} path="/budget/template" />
            <CollapsedMenuItem icon={<FolderOpen />} path="/budget/saved" />
            
            <CollapsedSeparator />
            
            <CollapsedMenuItem icon={<Bot />} path="/learn" />
            <CollapsedMenuItem icon={<LogOut />} path="/logout" />
          </div>
        </div>
      ) : (
        <div className="sidebar-menu flex-1 overflow-y-auto py-4 px-4">
          {/* Block 1: Home */}
          <div className="mb-6">
            <MenuItem icon={<Home />} label="Início" path="/" />
            <MenuItem icon={<User />} label="Meu Perfil" path="/profile" />
            <MenuItem icon={<Trophy />} label="Gamificação" path="/gamification" />
            
            <MenuItem icon={<Users />} label="Comunidade" path="/comunidade" />
            
            <SubMenu icon={<GraduationCap />} label="Cursos">
              <SubMenuItem label="Plataforma Original" path="/cursos" />
              
              <SubMenuItem 
                label="Gerenciar Categorias" 
                path="/cursos/categorias" 
                icon={<FolderOpen size={14} className="text-primary" />} 
              />
              
              <SubMenuItem 
                label="Meus Cursos" 
                path="/cursos/meus-cursos" 
                icon={<Bookmark size={14} className="text-primary" />} 
              />
              
              <SubMenuItem 
                label="Certificados" 
                path="/cursos/certificados" 
                icon={<Award size={14} className="text-primary" />} 
              />
              
              <SubMenuItem 
                label="Meu Progresso" 
                path="/cursos/progresso" 
                icon={<RotateCw size={14} className="text-primary" />} 
              />
              
              <SubMenu label="Netflix de Cursos" icon={<Play size={14} className="text-primary" />}>
                <SubMenuItem 
                  label="Catálogo" 
                  path="/cursos-netflix" 
                />
                
                <SubMenuItem 
                  label="Detalhes do Curso" 
                  path="/cursos/arquitetura-interiores-conceito-projeto" 
                  icon={<BookOpen size={14} className="text-primary" />} 
                />
                
                <SubMenuItem 
                  label="Assistir Aula" 
                  path="/cursos/arquitetura-interiores-conceito-projeto/aula/1" 
                  icon={<Video size={14} className="text-primary" />} 
                />
                
                <SubMenuItem 
                  label="Playlists" 
                  path="/cursos/playlists" 
                  icon={<ListMusic size={14} className="text-primary" />} 
                />
                
                <SubMenuItem 
                  label="Avaliações" 
                  path="/cursos/avaliacoes" 
                  icon={<Star size={14} className="text-primary" />} 
                />
              </SubMenu>
            </SubMenu>
            
            <MenuItem icon={<Star />} label="ConectaPremium" path="/conectapremium" />
            <SubMenu icon={<Image />} label="Editor de Imagens">
              <SubMenuItem label="Editor Padrão" path="/image-editor" />
              <SubMenuItem label="Editor Novo" path="/image-editor-new" icon={<Sparkles size={14} className="text-primary" />} />
            </SubMenu>
            
            <SubMenu icon={<BookOpen />} label="Blog">
              <SubMenuItem label="Página Principal" path="/blog" />
              <SubMenuItem label="Editor de Conteúdo" path="/blog/admin" />
              <SubMenuItem 
                label="Editor Elementor" 
                path="/blog/admin/post/novo" 
                icon={<Layout size={14} className="text-primary" />}
              />
            </SubMenu>
            
            <SubMenu icon={<Video />} label="Videoconferência">
              <SubMenuItem label="Minhas Reuniões" path="/videoconferencia" />
              <SubMenuItem label="Agendar Nova" path="/videoconferencia?new=true" />
              <SubMenuItem label="Detalhes da Reunião" path="/videoconferencia/1" icon={<FileText size={14} className="text-primary" />} />
              <SubMenuItem label="Transcrições" path="/videoconferencia?tab=transcriptions" icon={<MessageSquare size={14} className="text-primary" />} />
            </SubMenu>
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
              <MenuItem icon={<Users />} label={<span className="flex items-center">Colaboradores (nova)</span>} path="/collaborators-new" />
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
      )}
    </aside>
  );
};

export default Sidebar;
