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
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
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
    <header className="h-16 border-b border-border bg-background flex items-center px-4 z-10">
      <div className="flex-1 flex items-center justify-between">
        {/* Lado esquerdo */}
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar} 
            className="p-2 mr-2 rounded-md hover:bg-muted transition-colors duration-200"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex items-center">
            <Link href="/dashboard">
              <a className="flex items-center">
                <span className="text-lg font-semibold">
                  <span className="text-primary">Conecta</span>Working
                </span>
              </a>
            </Link>
          </div>
        </div>
        
        {/* Lado direito */}
        <div className="flex items-center space-x-4">
          {/* Elementos específicos do papel do usuário */}
          {renderRoleSpecificElements()}
          
          {/* Notificações (opcional) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative p-2 rounded-md hover:bg-muted transition-colors" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <div className="p-2 font-medium">Notificações</div>
              <DropdownMenuSeparator />
              <div className="p-2 text-sm text-muted-foreground">
                Sem notificações novas.
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Alternância de tema */}
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-md hover:bg-muted transition-colors"
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
              <button className="flex items-center space-x-2" aria-label="User menu">
                <div className="hidden md:block text-right">
                  <div className="font-medium">
                    {user?.metadata?.nome || 'Usuário'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user?.metadata?.profissao || 'Arquiteto(a)'}
                  </div>
                </div>
                <Avatar className="h-8 w-8">
                  {user?.metadata?.foto_url ? (
                    <AvatarImage src={user.metadata.foto_url} alt={user?.metadata?.nome || 'Avatar'} />
                  ) : (
                    <AvatarFallback>{getInitials(user?.metadata?.nome || '')}</AvatarFallback>
                  )}
                </Avatar>
                <ChevronDown className="h-4 w-4 hidden md:block" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer" onClick={() => window.location.href = '/profile'}>
                <User className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={() => window.location.href = '/change-password'}>
                <Lock className="mr-2 h-4 w-4" />
                <span>Alterar Senha</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => logout()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;