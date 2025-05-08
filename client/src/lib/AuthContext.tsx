import React, { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, ExtendedUser, logout } from './supabase';
import { useLocation } from 'wouter';

interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const user = await getCurrentUser();
        setUser(user);
      } catch (error) {
        console.error('Error loading user:', error);
        setError('Falha ao carregar dados do usuário');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await import('./supabase').then(({ loginWithEmail }) => 
        loginWithEmail(email, password)
      );
      
      const user = await getCurrentUser();
      setUser(user);

      // Redirecionamento baseado no role
      if (user) {
        import('./supabase').then(({ getRedirectPathByRole }) => {
          const redirectPath = getRedirectPathByRole(user.role, user.plano_ativo);
          setLocation(redirectPath);
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Tratamento de erros específicos
      if (error.message.includes('Invalid login credentials')) {
        setError('E-mail ou senha incorretos');
      } else if (error.message.includes('Email not confirmed')) {
        setError('E-mail não confirmado. Verifique sua caixa de entrada');
      } else {
        setError('Erro ao fazer login. Tente novamente mais tarde');
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      setLoading(true);
      setError(null);
      await import('./supabase').then(({ signUpWithEmail }) => 
        signUpWithEmail(email, password, metadata)
      );
      
      setLocation('/verificar-email');
    } catch (error: any) {
      console.error('Signup error:', error);
      
      if (error.message.includes('User already registered')) {
        setError('Este e-mail já está cadastrado');
      } else {
        setError('Erro ao criar conta. Tente novamente mais tarde');
      }
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      setUser(null);
      setLocation('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setError('Erro ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signUp,
        logout: handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook para proteger rotas
export const useProtectedRoute = (allowedRoles?: string[]) => {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirecionar para login se não estiver logado
        setLocation('/login');
      } else if (!user.plano_ativo) {
        // Redirecionar se o plano não estiver ativo
        setLocation('/plano-inativo');
      } else if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
        // Redirecionar se o usuário não tiver permissão para acessar a página
        import('./supabase').then(({ getRedirectPathByRole }) => {
          const redirectPath = getRedirectPathByRole(user.role, user.plano_ativo);
          setLocation(redirectPath);
        });
      }
    }
  }, [user, loading, allowedRoles, setLocation]);

  return { user, loading };
};