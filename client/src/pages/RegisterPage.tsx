import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/lib/theme';
import { Moon, Sun } from 'lucide-react';
import LogoDark from '@/assets/logo-dark.svg';
import LogoLight from '@/assets/logo-light.svg';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nome: '',
    sobrenome: '',
    empresa: '',
    telefone: '',
    role: 'gratuito' // Default role
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, error } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.email || !formData.password || !formData.nome) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios para continuar",
      });
      return;
    }
    
    // Validar senhas
    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Senhas não conferem",
        description: "As senhas digitadas não são iguais",
      });
      return;
    }
    
    // Validar complexidade da senha
    if (formData.password.length < 8) {
      toast({
        variant: "destructive",
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 8 caracteres",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { email, password, ...metadata } = formData;
      await signUp(email, password, metadata);
      
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Verifique seu e-mail para confirmar sua conta",
      });
      
      setLocation('/verificar-email');
    } catch (error) {
      // Error is already handled in the AuthContext
      console.error('Registration error:', error);
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
          <h2 className="text-2xl font-semibold">Crie sua conta</h2>
          <p className="text-muted-foreground mt-2">
            Comece a usar a plataforma ConectaWorking hoje mesmo
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Cadastro</CardTitle>
            <CardDescription>
              Preencha os campos abaixo para criar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="nome" className="text-sm font-medium">
                    Nome*
                  </label>
                  <Input
                    id="nome"
                    name="nome"
                    placeholder="Seu nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="sobrenome" className="text-sm font-medium">
                    Sobrenome
                  </label>
                  <Input
                    id="sobrenome"
                    name="sobrenome"
                    placeholder="Seu sobrenome"
                    value={formData.sobrenome}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  E-mail*
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Senha*
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Sua senha"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirmar Senha*
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirme sua senha"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="empresa" className="text-sm font-medium">
                  Empresa
                </label>
                <Input
                  id="empresa"
                  name="empresa"
                  placeholder="Nome da sua empresa"
                  value={formData.empresa}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="telefone" className="text-sm font-medium">
                  Telefone
                </label>
                <Input
                  id="telefone"
                  name="telefone"
                  placeholder="(00) 00000-0000"
                  value={formData.telefone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium">
                  Tipo de Conta*
                </label>
                <Select value={formData.role} onValueChange={handleSelectChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de conta" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gratuito">Gratuito</SelectItem>
                    <SelectItem value="pro">Profissional (Pro)</SelectItem>
                    <SelectItem value="empresa">Empresa</SelectItem>
                    <SelectItem value="lojista">Lojista</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Você poderá alterar o tipo de conta posteriormente.
                </p>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                disabled={isLoading}
              >
                {isLoading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-center w-full">
              <span className="text-sm text-muted-foreground">
                Já tem uma conta?{' '}
                <Link href="/login">
                  <a className="text-[#FFD600] hover:underline">
                    Faça login
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

export default RegisterPage;