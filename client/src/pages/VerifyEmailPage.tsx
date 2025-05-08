import React from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import LogoDark from '@/assets/logo-dark.svg';
import LogoLight from '@/assets/logo-light.svg';

const VerifyEmailPage: React.FC = () => {
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
              <div className="w-16 h-16 rounded-full bg-[#FFD600]/20 flex items-center justify-center">
                <Mail className="w-8 h-8 text-[#FFD600]" />
              </div>
            </div>
            <CardTitle className="text-center">Verifique seu e-mail</CardTitle>
            <CardDescription className="text-center">
              Enviamos um link de confirmação para o seu e-mail.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Para acessar a plataforma, clique no link que enviamos para o seu e-mail cadastrado.
            </p>
            <p className="text-sm mb-4">
              Se não encontrar o e-mail na sua caixa de entrada, verifique também na pasta de spam.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Link href="/login">
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" /> Voltar para o login
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        <div className="text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ConectaWorking. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;