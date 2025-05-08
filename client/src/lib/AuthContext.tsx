import React, { createContext, useState, useEffect, useContext } from "react";
import { useLocation } from "wouter";
import { 
  getCurrentUser, 
  loginWithEmail, 
  signUpWithEmail, 
  logout as supabaseLogout,
  getRedirectPathByRole,
  type ExtendedUser,
  type UserMetadata
} from "./supabase";

interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata: Partial<UserMetadata>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  login: async () => {},
  signUp: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  // Carregar o usuário atual na montagem
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error("Erro ao carregar usuário:", err);
        setError("Falha ao carregar informações do usuário.");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Redirecionar com base no papel do usuário
  useEffect(() => {
    if (!loading && user) {
      const currentPath = window.location.pathname;
      
      // Se estiver em uma rota de autenticação ou em /plano-inativo, verifique se deve redirecionar
      if (['/login', '/cadastro', '/verificar-email'].includes(currentPath)) {
        const redirectPath = getRedirectPathByRole(user.role, user.plano_ativo);
        setLocation(redirectPath);
      }
      
      // Se o plano estiver inativo e não estiver na página de plano inativo, redirecione
      if (!user.plano_ativo && currentPath !== '/plano-inativo') {
        setLocation('/plano-inativo');
      }
    }
  }, [loading, user, setLocation]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await loginWithEmail(email, password);
      
      // Obter o usuário após o login
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      // Redirecionar com base no papel
      if (currentUser) {
        const redirectPath = getRedirectPathByRole(currentUser.role, currentUser.plano_ativo);
        setLocation(redirectPath);
      }
    } catch (err) {
      console.error("Erro no login:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro durante o login.");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata: Partial<UserMetadata>) => {
    try {
      setLoading(true);
      setError(null);
      
      await signUpWithEmail(email, password, metadata);
      
      // Após o cadastro, o usuário deve verificar o email
      // Redirecionar para a página de verificação de email
      setLocation("/verificar-email");
    } catch (err) {
      console.error("Erro no cadastro:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro durante o cadastro.");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      
      await supabaseLogout();
      setUser(null);
      setLocation("/login");
    } catch (err) {
      console.error("Erro ao sair:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro ao sair da conta.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signUp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

// Hook para proteger rotas com base no papel do usuário
export const useProtectedRoute = (allowedRoles?: string[]) => {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading) {
      // Se não há usuário, redirecionar para login
      if (!user) {
        setLocation("/login");
        return;
      }

      // Se o plano está inativo, redirecionar para página de plano inativo
      if (!user.plano_ativo) {
        setLocation("/plano-inativo");
        return;
      }

      // Se há restrição de papéis e o usuário não tem permissão, redirecionar
      if (allowedRoles && allowedRoles.length > 0) {
        if (!user.role || !allowedRoles.includes(user.role)) {
          // Redirecionar para a página apropriada com base no papel do usuário
          const redirectPath = getRedirectPathByRole(user.role, user.plano_ativo);
          setLocation(redirectPath);
        }
      }
    }
  }, [user, loading, allowedRoles, setLocation]);

  return { user, loading };
};