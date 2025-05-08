import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { ThemeProvider, useTheme } from '@/lib/theme';
import { Moon, Sun } from 'lucide-react';
import LogoDark from '@/assets/logo-dark.svg';
import LogoLight from '@/assets/logo-light.svg';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, error } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha o e-mail e a senha para continuar",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      await login(email, password);
    } catch (error) {
      // Error is already handled in the AuthContext
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="absolute top-4 right-4">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          <span className="sr-only">Alternar tema</span>
        </Button>
      </div>
      
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto w-[200px] mb-6">
            <img 
              src={theme === 'dark' ? LogoLight : LogoDark} 
              alt="ConectaWorking Logo" 
              className="w-full" 
            />
          </div>
          <h2 className="text-2xl font-semibold">Bem-vindo à ConectaWorking</h2>
          <p className="text-muted-foreground mt-2">
            A plataforma inteligente que conecta profissionais de arquitetura e design
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Acesse sua conta</CardTitle>
            <CardDescription>
              Entre com seu e-mail e senha para acessar a plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  E-mail
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Senha
                  </label>
                  <Link href="/esqueci-senha">
                    <a className="text-xs text-[#FFD600] hover:underline">
                      Esqueceu a senha?
                    </a>
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center w-full">
              <span className="text-sm text-muted-foreground">
                Não tem uma conta?{' '}
                <Link href="/cadastro">
                  <a className="text-[#FFD600] hover:underline">
                    Criar conta
                  </a>
                </Link>
              </span>
            </div>
          </CardFooter>
        </Card>
        
        <div className="text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ConectaWorking. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;