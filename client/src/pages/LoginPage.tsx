import { useState } from "react";
import { Link, useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/lib/AuthContext";
import { Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/lib/theme";
import logoDarkSrc from "../assets/logo-dark.svg";
import logoLightSrc from "../assets/logo-light.svg";

// Esquema de validação para o formulário de login
const loginSchema = z.object({
  email: z.string().email("Digite um email válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
});

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { theme } = useTheme();
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await login(values.email, values.password);
      // Não precisamos redirecionar aqui, o AuthContext fará isso automaticamente
      // com base no papel do usuário
      toast({
        title: "Login realizado com sucesso",
        description: "Você será redirecionado para sua área",
      });
    } catch (err) {
      console.error("Erro no login:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro ao fazer login. Verifique suas credenciais.");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Entre com suas credenciais para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="seu@email.com" 
                        type="email" 
                        autoComplete="email"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Sua senha" 
                        type="password" 
                        autoComplete="current-password"
                        disabled={isLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-[#FFD600] hover:bg-[#FFD600]/90 text-black" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            Não tem uma conta?{" "}
            <Link to="/cadastro" className="text-primary hover:underline">
              Cadastre-se
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}