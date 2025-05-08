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

// Esquema de validação para o formulário de cadastro
const registerSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  sobrenome: z.string().optional(),
  empresa: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email("Digite um email válido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  passwordConfirm: z.string().min(6, "A confirmação de senha deve ter pelo menos 6 caracteres"),
}).refine((data) => data.password === data.passwordConfirm, {
  message: "As senhas não coincidem",
  path: ["passwordConfirm"],
});

export default function RegisterPage() {
  const [, setLocation] = useLocation();
  const { signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { theme } = useTheme();
  
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nome: "",
      sobrenome: "",
      empresa: "",
      telefone: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signUp(values.email, values.password, {
        nome: values.nome,
        sobrenome: values.sobrenome || undefined,
        empresa: values.empresa || undefined,
        telefone: values.telefone || undefined,
        role: 'gratuito', // Papel padrão para novos usuários
        plano_ativo: true, // Por padrão, o plano está ativo
        created_at: new Date().toISOString(),
      });
      
      toast({
        title: "Cadastro realizado com sucesso",
        description: "Verifique seu email para confirmar sua conta",
      });
      
      // Redirecionar para a página de verificação de email
      setLocation("/verificar-email");
    } catch (err) {
      console.error("Erro no cadastro:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro ao criar sua conta. Tente novamente mais tarde.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-6">
            <img 
              src={theme === 'dark' ? logoLightSrc : logoDarkSrc} 
              alt="ConectaWorking" 
              className="h-12"
            />
          </div>
          <CardTitle className="text-2xl font-bold">Cadastre-se</CardTitle>
          <CardDescription>
            Crie sua conta para começar a usar o ConectaWorking
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Seu nome"
                          autoComplete="given-name"
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
                  name="sobrenome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sobrenome</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Seu sobrenome"
                          autoComplete="family-name"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="empresa"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Empresa</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nome da empresa"
                          autoComplete="organization"
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
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(00) 00000-0000"
                          type="tel"
                          autoComplete="tel"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Crie uma senha"
                          type="password"
                          autoComplete="new-password"
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
                  name="passwordConfirm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Confirme a senha"
                          type="password"
                          autoComplete="new-password"
                          disabled={isLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-[#FFD600] hover:bg-[#FFD600]/90 text-black" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  "Criar Conta"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Faça login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}