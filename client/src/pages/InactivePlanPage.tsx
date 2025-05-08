import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/theme';
import LogoDark from '@/assets/logo-dark.svg';
import LogoLight from '@/assets/logo-light.svg';

const InactivePlanPage: React.FC = () => {
  const { logout } = useAuth();
  const { theme } = useTheme();
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto w-[200px] mb-6">
            <img 
              src={theme === 'dark' ? LogoLight : LogoDark} 
              alt="ConectaWorking Logo" 
              className="w-full" 
            />
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <CardTitle className="text-center">Plano Inativo</CardTitle>
            <CardDescription className="text-center">
              Seu plano está atualmente inativo.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Para continuar utilizando a plataforma ConectaWorking, é necessário renovar ou ativar seu plano.
            </p>
            <p className="text-sm mb-4">
              Entre em contato com nosso suporte ou acesse a página de planos para mais informações.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Link href="/planos">
              <Button
                className="w-full bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
              >
                Ver Planos
              </Button>
            </Link>
            <Link href="/">
              <Button
                variant="outline"
                className="w-full"
                onClick={logout}
              >
                Sair
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        <div className="text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ConectaWorking. Todos os direitos reservados.</p>
          <p className="mt-1">
            Para suporte, entre em contato em{' '}
            <a href="mailto:suporte@conectaworking.dev" className="text-[#FFD600] hover:underline">
              suporte@conectaworking.dev
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InactivePlanPage;