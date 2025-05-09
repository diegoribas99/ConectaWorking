import React from 'react';
import { Menu, Bell, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  isDesktop: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen, isDesktop }) => {
  return (
    <header className="h-16 px-4 border-b border-border flex items-center justify-between bg-background">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {(!isDesktop || !isSidebarOpen) && (
          <div className="font-bold text-xl">
            <span className="text-primary">Conecta</span>Working
          </div>
        )}
      </div>
      
      <div className="hidden md:flex items-center max-w-md w-full">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar em toda plataforma..."
            className="pl-8 rounded-full"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative rounded-full h-8 w-8 p-0">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary">AD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem>Configurações</DropdownMenuItem>
            <DropdownMenuItem>Plano e Faturamento</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;