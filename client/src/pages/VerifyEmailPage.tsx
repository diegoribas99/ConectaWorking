import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Check } from "lucide-react";
import { useTheme } from "@/lib/theme";
import logoDarkSrc from "../assets/logo-dark.svg";
import logoLightSrc from "../assets/logo-light.svg";

export default function VerifyEmailPage() {
  const { theme } = useTheme();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-6">
            <img 
              src={theme === 'dark' ? logoLightSrc : logoDarkSrc} 
              alt="ConectaWorking" 
              className="h-12"
            />
          </div>
          <div className="flex justify-center">
            <div className="rounded-full bg-yellow-100 p-3 mb-4">
              <Mail className="h-6 w-6 text-[#FFD600]" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Verifique seu Email</CardTitle>
          <CardDescription>
            Enviamos um link de confirmação para o seu endereço de email
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Por favor, verifique sua caixa de entrada (e também a pasta de spam) e clique no link 
              de confirmação para ativar sua conta.
            </p>
            
            <div className="border border-border rounded-md p-4 bg-muted/50">
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Check className="h-4 w-4 mr-2 text-green-500" /> 
                Próximos passos:
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1 text-left list-disc list-inside">
                <li>Confirme seu email clicando no link enviado</li>
                <li>Faça login com suas credenciais</li>
                <li>Complete seu perfil para aproveitar ao máximo a plataforma</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            Já confirmou?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Faça login
            </Link>
          </div>
          <div className="text-xs text-center text-muted-foreground">
            Não recebeu o email?{" "}
            <button className="text-primary hover:underline text-xs">
              Reenviar email de confirmação
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}