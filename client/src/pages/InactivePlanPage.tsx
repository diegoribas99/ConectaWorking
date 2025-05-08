import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/AuthContext";
import logoDarkSrc from "../assets/logo-dark.svg";
import logoLightSrc from "../assets/logo-light.svg";

export default function InactivePlanPage() {
  const { theme } = useTheme();
  const { logout } = useAuth();
  
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
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Plano Inativo</CardTitle>
          <CardDescription>
            Seu plano está atualmente inativo
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Para continuar utilizando todos os recursos da ConectaWorking, 
              por favor renove ou ative seu plano.
            </p>
            
            <div className="border border-border rounded-md p-4 bg-muted/50">
              <h3 className="text-sm font-medium mb-2">Benefícios do plano ativo:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 text-left list-disc list-inside">
                <li>Precificação inteligente de projetos</li>
                <li>Gerenciamento de clientes e projetos</li>
                <li>Geração de orçamentos profissionais</li>
                <li>Modelos personalizados</li>
                <li>Acesso ao suporte técnico</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button 
            className="w-full bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
            asChild
          >
            <Link to="/">
              Ver Planos Disponíveis
            </Link>
          </Button>
          
          <div className="text-sm text-center text-muted-foreground pt-2">
            <button 
              onClick={() => logout()} 
              className="text-primary hover:underline"
            >
              Sair da conta
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}