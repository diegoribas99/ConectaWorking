/**
 * Script para criar usuários de teste no Supabase Auth
 * 
 * Este script é usado para criar usuários de teste com diferentes roles
 * e atualizá-los na tabela 'usuarios'.
 * 
 * Para usar:
 * 1. Configure as variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
 * 2. Execute: node scripts/create-test-users.js
 */

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Chave de service role (não a anon key)

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Erro: Configure as variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Cliente do Supabase com service role key para acesso administrativo
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Lista de usuários de teste para criar
const testUsers = [
  { email: 'teste1@conectaworking.dev', password: '12345678', role: 'gratuito', nome: 'Usuário Gratuito' },
  { email: 'teste2@conectaworking.dev', password: '12345678', role: 'pro', nome: 'Usuário Pro' },
  { email: 'teste3@conectaworking.dev', password: '12345678', role: 'premium', nome: 'Usuário Premium' },
  { email: 'teste4@conectaworking.dev', password: '12345678', role: 'vip', nome: 'Usuário VIP' },
  { email: 'admin@conectaworking.dev', password: '12345678', role: 'admin', nome: 'Administrador' },
  { email: 'lojista@conectaworking.dev', password: '12345678', role: 'lojista', nome: 'Lojista Exemplo' },
  { email: 'empresa@conectaworking.dev', password: '12345678', role: 'empresa', nome: 'Empresa Exemplo' },
];

// Função para criar ou atualizar um usuário
async function createOrUpdateUser(user) {
  try {
    // Verificar se o usuário já existe
    const { data: existingUser, error: queryError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', user.email)
      .single();
    
    if (queryError && queryError.code !== 'PGRST116') {
      console.error(`Erro ao verificar usuário ${user.email}:`, queryError);
      return;
    }
    
    if (existingUser) {
      console.log(`Usuário ${user.email} já existe. Atualizando...`);
      
      // Atualizar usuário na tabela 'usuarios'
      const { data, error } = await supabase
        .from('usuarios')
        .update({
          role: user.role,
          plano_ativo: true,
          nome: user.nome
        })
        .eq('email', user.email);
      
      if (error) {
        console.error(`Erro ao atualizar usuário ${user.email}:`, error);
      } else {
        console.log(`Usuário ${user.email} atualizado com sucesso`);
      }
    } else {
      console.log(`Criando novo usuário: ${user.email}`);
      
      // Criar usuário no Supabase Auth
      const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true, // Confirma o email automaticamente
        user_metadata: {
          nome: user.nome
        }
      });
      
      if (createError) {
        console.error(`Erro ao criar usuário ${user.email}:`, createError);
        return;
      }
      
      console.log(`Usuário ${user.email} criado no Auth`);
      
      // Atualizar o role na tabela 'usuarios' (Isso só é necessário se o trigger não inserir o usuário corretamente)
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ 
          role: user.role,
          plano_ativo: true,
          nome: user.nome
        })
        .eq('id', authUser.user.id);
      
      if (updateError) {
        console.error(`Erro ao definir role para ${user.email}:`, updateError);
      } else {
        console.log(`Role ${user.role} definido para ${user.email}`);
      }
    }
  } catch (err) {
    console.error(`Erro inesperado ao processar ${user.email}:`, err);
  }
}

// Executar a criação dos usuários de teste
async function main() {
  console.log('Iniciando criação de usuários de teste...');
  
  for (const user of testUsers) {
    await createOrUpdateUser(user);
  }
  
  console.log('Todos os usuários de teste foram processados.');
}

main().catch(console.error);