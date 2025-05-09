import React from 'react';
import { Menu, Bell, User, Search, Moon, Sun, Laptop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/lib/theme';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  isDesktop: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen, isDesktop }) => {
  const { theme, setTheme } = useTheme();
  
  // Dados simulados do usuário atual
  const currentUser = {
    name: "Ana Silva",
    email: "ana.silva@gmail.com",
    avatar: "", // URL da imagem de avatar 
    initials: "AS",
    plan: "Premium" // ou "Básico", "Profissional", etc.
  };
  
  return (
    <header className="h-16 px-6 border-b border-border/40 flex items-center justify-between bg-background shadow-sm sticky top-0 z-20">
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
        {/* Seletor de Tema */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary transition-colors">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5" />
              ) : theme === 'light' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Laptop className="h-5 w-5" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="border-border/60 shadow-md">
            <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}>
              <DropdownMenuRadioItem value="light" className="cursor-pointer">
                <Sun className="mr-2 h-4 w-4" />
                <span>Claro</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="dark" className="cursor-pointer">
                <Moon className="mr-2 h-4 w-4" />
                <span>Escuro</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="system" className="cursor-pointer">
                <Laptop className="mr-2 h-4 w-4" />
                <span>Sistema</span>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Notificações */}
        <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 hover:text-primary transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary shadow-sm"></span>
        </Button>
        
        {/* Perfil do Usuário */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative flex items-center gap-2 pl-2 pr-3 hover:bg-primary/10 transition-colors rounded-full">
              <Avatar className="h-8 w-8 border-2 border-primary/20">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary">{currentUser.initials}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-sm font-medium leading-none">{currentUser.name.split(' ')[0]}</span>
                <Badge variant="outline" className="mt-1 h-5 px-2 bg-primary/10 text-primary text-xs font-medium">
                  {currentUser.plan}
                </Badge>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-border/60 shadow-md">
            <div className="flex flex-col p-2">
              <p className="font-medium">{currentUser.name}</p>
              <p className="text-sm text-muted-foreground truncate">{currentUser.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer hover:bg-primary/5 focus:bg-primary/5">
              <User className="mr-2 h-4 w-4" />
              <span>Meu Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer hover:bg-primary/5 focus:bg-primary/5">Configurações</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer hover:bg-primary/5 focus:bg-primary/5">
              <span>Plano e Faturamento</span>
              <Badge className="ml-auto bg-primary text-white">{currentUser.plan}</Badge>
            </DropdownMenuItem>
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