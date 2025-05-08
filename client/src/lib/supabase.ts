import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuração do Supabase
// Em ambiente de desenvolvimento, vamos usar valores simulados para demonstração
// Em produção, esses valores seriam substituídos pelas variáveis de ambiente reais
const supabaseUrl = 'https://xyzcompany.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZha2VrZXkiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxODAwMDAwMDAwfQ.fake-key-for-demo-only';

console.log('Ambiente de demonstração: usando Supabase com dados simulados');

// Interface de metadados do usuário
export interface UserMetadata {
  role: 'gratuito' | 'pro' | 'premium' | 'vip' | 'admin' | 'lojista' | 'empresa';
  plano_ativo: boolean;
  nome: string;
  sobrenome?: string;
  empresa?: string;
  telefone?: string;
  created_at: string;
}

// Interface de usuário estendido
export interface ExtendedUser {
  id: string;
  email: string;
  metadata: UserMetadata | null;
  role: string | null;
  plano_ativo: boolean;
}

// Cliente do Supabase
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Função para obter os metadados do usuário
export async function getUserMetadata(userId: string): Promise<UserMetadata | null> {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erro ao obter metadados do usuário:', error);
      return null;
    }

    return {
      role: data.role,
      plano_ativo: data.plano_ativo,
      nome: data.nome,
      sobrenome: data.sobrenome,
      empresa: data.empresa,
      telefone: data.telefone,
      created_at: data.created_at,
    };
  } catch (err) {
    console.error('Erro ao obter metadados do usuário:', err);
    return null;
  }
}

// Interface para usuários mock
interface MockUser {
  id: string;
  email: string;
  password: string;
  metadata: UserMetadata;
}

// Interface para o dicionário de usuários mock
interface MockUsersDict {
  [email: string]: MockUser;
}

// MOCK USERS PARA DEMONSTRAÇÃO
const MOCK_USERS: MockUsersDict = {
  'admin@conectaworking.dev': {
    id: '1',
    email: 'admin@conectaworking.dev',
    password: '12345678',
    metadata: {
      role: 'admin',
      plano_ativo: true,
      nome: 'Administrador',
      sobrenome: '',
      empresa: 'ConectaWorking',
      telefone: '11999999999',
      created_at: new Date().toISOString()
    }
  },
  'pro@conectaworking.dev': {
    id: '2',
    email: 'pro@conectaworking.dev',
    password: '12345678',
    metadata: {
      role: 'pro',
      plano_ativo: true,
      nome: 'Usuário Pro',
      sobrenome: 'Exemplo',
      empresa: 'Arquitetura Moderna',
      telefone: '11988888888',
      created_at: new Date().toISOString()
    }
  },
  'gratis@conectaworking.dev': {
    id: '3',
    email: 'gratis@conectaworking.dev',
    password: '12345678',
    metadata: {
      role: 'gratuito',
      plano_ativo: true,
      nome: 'Usuário Gratuito',
      sobrenome: 'Demo',
      empresa: 'Studio Design',
      telefone: '11977777777',
      created_at: new Date().toISOString()
    }
  },
  'inativo@conectaworking.dev': {
    id: '4',
    email: 'inativo@conectaworking.dev',
    password: '12345678',
    metadata: {
      role: 'pro',
      plano_ativo: false,
      nome: 'Usuário Inativo',
      sobrenome: 'Vencido',
      empresa: 'Interior Design Co.',
      telefone: '11966666666',
      created_at: new Date().toISOString()
    }
  }
};

// Variável para armazenar o usuário atual na sessão
let currentMockUser: string | null = localStorage.getItem('mock_user');

// Função para persistir o usuário atual
function setCurrentMockUser(email: string | null): void {
  currentMockUser = email;
  if (email) {
    localStorage.setItem('mock_user', email);
  } else {
    localStorage.removeItem('mock_user');
  }
}

// Função para obter o usuário atual - VERSÃO MOCK
export async function getCurrentUser(): Promise<ExtendedUser | null> {
  try {
    // Se estamos em modo demonstração, retorna o usuário do localStorage
    if (currentMockUser) {
      const user = MOCK_USERS[currentMockUser];
      return {
        id: user.id,
        email: user.email,
        metadata: user.metadata,
        role: user.metadata.role,
        plano_ativo: user.metadata.plano_ativo
      };
    }
    
    // Em um ambiente real, usaria o código abaixo
    // const { data: { user }, error } = await supabase.auth.getUser();
    // if (error || !user) return null;
    // const metadata = await getUserMetadata(user.id);
    // return {
    //   id: user.id,
    //   email: user.email || '',
    //   metadata,
    //   role: metadata?.role || null,
    //   plano_ativo: metadata?.plano_ativo || false,
    // };
    
    return null;
  } catch (err) {
    console.error('Erro ao obter usuário atual:', err);
    return null;
  }
}

// Função para login com email e senha - VERSÃO MOCK
export async function loginWithEmail(email: string, password: string) {
  // Simulando delay de rede
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Verificando credenciais
  const user = MOCK_USERS[email];
  
  if (!user || user.password !== password) {
    throw new Error('Email ou senha incorretos');
  }
  
  // Armazenar usuário na sessão
  setCurrentMockUser(email);
  
  return { 
    user: {
      id: user.id,
      email: user.email,
      user_metadata: user.metadata
    }
  };
}

// Função para registro com email e senha - VERSÃO MOCK
export async function signUpWithEmail(email: string, password: string, metadata: Partial<UserMetadata>) {
  // Simulando delay de rede
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  if (MOCK_USERS[email]) {
    throw new Error('Este email já está em uso');
  }
  
  // Registrar novo usuário
  const newId = Object.keys(MOCK_USERS).length + 1;
  MOCK_USERS[email] = {
    id: newId.toString(),
    email,
    password,
    metadata: {
      role: metadata.role || 'gratuito',
      plano_ativo: metadata.plano_ativo !== undefined ? metadata.plano_ativo : true,
      nome: metadata.nome || 'Novo Usuário',
      sobrenome: metadata.sobrenome,
      empresa: metadata.empresa,
      telefone: metadata.telefone,
      created_at: new Date().toISOString()
    }
  };
  
  return { 
    user: {
      id: newId.toString(),
      email,
      user_metadata: MOCK_USERS[email].metadata
    } 
  };
}

// Função para logout - VERSÃO MOCK
export async function logout() {
  // Simulando delay de rede
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Remover usuário da sessão
  setCurrentMockUser(null);
  
  return true;
}

// Função para determinar o caminho de redirecionamento com base no papel do usuário
export function getRedirectPathByRole(role: string | null, planoAtivo: boolean): string {
  if (!planoAtivo) {
    return '/plano-inativo';
  }

  switch (role) {
    case 'gratuito':
      return '/dashboard-basico';
    case 'admin':
      return '/admin/dashboard';
    case 'pro':
    case 'premium':
    case 'vip':
      return '/dashboard';
    case 'lojista':
      return '/lojista/dashboard';
    case 'empresa':
      return '/empresa/dashboard';
    default:
      return '/login';
  }
}