import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  User, Settings, LogOut, Moon, Sun, ChevronDown, 
  Menu, Bell, Star, ArrowUpRight, Lock 
} from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, sidebarOpen }) => {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [notificationCount, setNotificationCount] = useState<number>(3); // Exemplo estático

  // Obtém as iniciais do nome do usuário para o avatar
  const getInitials = (nome: string): string => {
    if (!nome) return 'U';
    const parts = nome.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Determina elementos específicos baseados no papel do usuário
  const renderRoleSpecificElements = () => {
    if (!user) return null;

    const role = user.role || 'gratuito';

    switch (role) {
      case 'gratuito':
        return (
          <div className="hidden md:flex items-center">
            <span className="text-xs text-muted-foreground mr-2">Você está no Plano Descoberta</span>
            <Button size="sm" variant="outline" className="text-xs flex items-center gap-1">
              Fazer Upgrade <ArrowUpRight className="h-3 w-3" />
            </Button>
          </div>
        );
      case 'pro':
        return (
          <Badge variant="outline" className="hidden md:flex">
            Plano Profissional
          </Badge>
        );
      case 'premium':
        return (
          <Badge variant="outline" className="hidden md:flex items-center gap-1">
            Plano Premium <Star className="h-3 w-3 text-[#FFD600]" />
          </Badge>
        );
      case 'vip':
        return (
          <div className="hidden md:flex items-center gap-2">
            <Badge className="bg-[#FFD600] text-black">VIP</Badge>
            <Button size="sm" variant="outline" className="text-xs">Mentoria</Button>
          </div>
        );
      case 'admin':
        return (
          <Button size="sm" variant="ghost" className="hidden md:flex items-center">
            <Settings className="h-4 w-4" />
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <header className="h-16 border-b border-border bg-background flex items-center px-4 z-10 shadow-md">
      <div className="flex-1 flex items-center justify-between max-w-7xl mx-auto">
        {/* Lado esquerdo */}
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar} 
            className="p-2 mr-3 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors duration-200"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center">
            {!sidebarOpen && (
            <Link href="/dashboard">
              <div className="flex items-center cursor-pointer">
                <span className="text-xl font-bold tracking-tight">
                  <span className="text-primary">Conecta</span>
                  <span>Working</span>
                  <Badge className="ml-2 bg-primary/10 text-primary hover:bg-primary/20 border-none text-[10px]">
                    Preview
                  </Badge>
                </span>
              </div>
            </Link>
          )}
          </div>
        </div>

        {/* Lado direito */}
        <div className="flex items-center space-x-4">
          {/* Elementos específicos do papel do usuário */}
          {renderRoleSpecificElements()}

          {/* Notificações (opcional) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors duration-200" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="p-3 font-medium border-b">Notificações</div>
              <div className="p-3 text-sm text-muted-foreground">
                Sem notificações novas.
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Alternância de tema */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors duration-200"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* Dropdown de perfil do usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-2 py-1 px-2 hover:bg-primary/5 rounded-md transition-colors duration-200" aria-label="User menu">
                <div className="hidden md:block text-right">
                  <div className="font-medium text-sm">
                    {user?.metadata?.nome || 'Usuário'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user?.metadata?.profissao || 'Arquiteto(a)'}
                  </div>
                </div>
                <Avatar className="h-9 w-9 border-2 border-primary/20">
                  {user?.metadata?.foto_url ? (
                    <AvatarImage src={user.metadata.foto_url} alt={user?.metadata?.nome || 'Avatar'} />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">{getInitials(user?.metadata?.nome || '')}</AvatarFallback>
                  )}
                </Avatar>
                <ChevronDown className="h-4 w-4 hidden md:block text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2 border-b">
                <div className="font-medium">{user?.metadata?.nome || 'Usuário'}</div>
                <div className="text-xs text-muted-foreground">{user?.email}</div>
              </div>
              <DropdownMenuItem className="cursor-pointer hover:bg-primary/5 focus:bg-primary/5 py-2" onClick={() => window.location.href = '/profile'}>
                <User className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-primary/5 focus:bg-primary/5 py-2" onClick={() => window.location.href = '/change-password'}>
                <Lock className="mr-2 h-4 w-4" />
                <span>Alterar Senha</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer hover:bg-red-500/10 focus:bg-red-500/10 py-2" onClick={() => logout()}>
                <LogOut className="mr-2 h-4 w-4 text-red-500" />
                <span className="text-red-500">Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;