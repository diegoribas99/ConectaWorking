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
    <header className="h-16 px-6 border-b border-border/40 flex items-center justify-between bg-background shadow-sm">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
          className="hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {(!isDesktop || !isSidebarOpen) && (
          <div className="font-bold text-xl ml-1">
            <span className="text-primary">Conecta</span>Working
          </div>
        )}
      </div>
      
      <div className="hidden md:flex items-center max-w-md w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar em toda plataforma..."
            className="pl-9 rounded-full border-border/60 bg-background shadow-sm focus-visible:ring-primary/50"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 hover:text-primary transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary shadow-sm"></span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative rounded-full h-9 w-9 p-0 hover:bg-primary/10 transition-colors">
              <Avatar className="h-8 w-8 border-2 border-primary/20">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary">AD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-border/60 shadow-md">
            <DropdownMenuLabel className="font-medium">Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer hover:bg-primary/5 focus:bg-primary/5">
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer hover:bg-primary/5 focus:bg-primary/5">Configurações</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer hover:bg-primary/5 focus:bg-primary/5">Plano e Faturamento</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 cursor-pointer hover:bg-red-50 focus:bg-red-50 dark:hover:bg-red-950/30 dark:focus:bg-red-950/30">
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;