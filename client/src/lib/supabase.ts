import { createClient } from '@supabase/supabase-js';

// Constantes para a conexão com o Supabase
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing. Please check environment variables.');
}

// Tipos para o usuário
export interface UserMetadata {
  role: 'gratuito' | 'pro' | 'premium' | 'vip' | 'admin' | 'lojista' | 'empresa';
  plano_ativo: boolean;
  nome: string;
  sobrenome?: string;
  empresa?: string;
  telefone?: string;
  created_at: string;
}

// Interface que estende o tipo User do Supabase com nossos metadados personalizados
export interface ExtendedUser {
  id: string;
  email: string;
  metadata: UserMetadata | null;
  role: string | null;
  plano_ativo: boolean;
}

// Criar cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para buscar metadados do usuário
export async function getUserMetadata(userId: string): Promise<UserMetadata | null> {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user metadata:', error);
      return null;
    }

    return data as UserMetadata;
  } catch (error) {
    console.error('Unexpected error fetching user metadata:', error);
    return null;
  }
}

// Função para obter usuário atual com metadados
export async function getCurrentUser(): Promise<ExtendedUser | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      return null;
    }

    const metadata = await getUserMetadata(user.id);
    
    return {
      id: user.id,
      email: user.email || '',
      metadata,
      role: metadata?.role || null,
      plano_ativo: metadata?.plano_ativo || false
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Função para realizar login
export async function loginWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
}

// Função para realizar cadastro
export async function signUpWithEmail(email: string, password: string, metadata: Partial<UserMetadata>) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: metadata.role || 'gratuito', // Default role
        plano_ativo: true,
        nome: metadata.nome || '',
        sobrenome: metadata.sobrenome || '',
        empresa: metadata.empresa || '',
        telefone: metadata.telefone || '',
      }
    }
  });
  
  if (error) throw error;
  
  // Após criar o usuário na autenticação, vamos adicionar à tabela "usuarios"
  if (data.user) {
    const { error: userError } = await supabase
      .from('usuarios')
      .insert([
        { 
          id: data.user.id,
          email: data.user.email,
          role: metadata.role || 'gratuito',
          plano_ativo: true,
          nome: metadata.nome || '',
          sobrenome: metadata.sobrenome || '',
          empresa: metadata.empresa || '',
          telefone: metadata.telefone || '',
        }
      ]);
    
    if (userError) {
      console.error('Error inserting user metadata:', userError);
    }
  }
  
  return data;
}

// Função para realizar logout
export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Função para redirecionamento baseado no role
export function getRedirectPathByRole(role: string | null, planoAtivo: boolean): string {
  if (!planoAtivo) {
    return '/plano-inativo';
  }
  
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'premium':
    case 'pro':
    case 'vip':
      return '/dashboard';
    case 'lojista':
      return '/lojista/dashboard';
    case 'empresa':
      return '/empresa/dashboard';
    case 'gratuito':
    default:
      return '/dashboard-basico';
  }
}