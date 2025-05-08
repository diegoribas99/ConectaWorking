-- Criação da tabela de usuários
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'gratuito' CHECK (role IN ('gratuito', 'pro', 'premium', 'vip', 'admin', 'lojista', 'empresa')),
    plano_ativo BOOLEAN NOT NULL DEFAULT true,
    nome TEXT NOT NULL,
    sobrenome TEXT,
    empresa TEXT,
    telefone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Criação de política de acesso RLS (Row Level Security)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para usuários autenticados
CREATE POLICY "Usuários podem ver seus próprios dados" 
    ON public.usuarios FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios dados" 
    ON public.usuarios FOR UPDATE 
    USING (auth.uid() = id);

-- Políticas adicionais para administradores
CREATE POLICY "Administradores podem ver todos os usuários" 
    ON public.usuarios FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Administradores podem atualizar todos os usuários" 
    ON public.usuarios FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Administradores podem excluir usuários" 
    ON public.usuarios FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.usuarios 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Função para atualizar o timestamp de 'updated_at' automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_usuarios_updated_at
BEFORE UPDATE ON public.usuarios
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Função para sincronizar usuários novos do auth.users para public.usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (id, email, role, nome)
    VALUES (NEW.id, NEW.email, 'gratuito', COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para inserir novo usuário na tabela pública quando criado no auth
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- NOTA: Para criar os usuários de teste, você deve primeiro criar os usuários através da API de autenticação do Supabase 
-- usando a função createUser. Depois, você pode atualizar os roles e outros dados na tabela 'usuarios'.

-- Importante: Não defina as senhas diretamente no banco de dados. O Supabase Auth gerencia as senhas de forma segura.

-- Exemplo de como seria um script para atualizar usuários após criá-los via API:
-- UPDATE public.usuarios SET role = 'gratuito', plano_ativo = true WHERE email = 'teste1@conectaworking.dev';
-- UPDATE public.usuarios SET role = 'pro', plano_ativo = true WHERE email = 'teste2@conectaworking.dev';
-- UPDATE public.usuarios SET role = 'premium', plano_ativo = true WHERE email = 'teste3@conectaworking.dev';
-- UPDATE public.usuarios SET role = 'vip', plano_ativo = true WHERE email = 'teste4@conectaworking.dev';
-- UPDATE public.usuarios SET role = 'admin', plano_ativo = true WHERE email = 'admin@conectaworking.dev';
-- UPDATE public.usuarios SET role = 'lojista', plano_ativo = true WHERE email = 'lojista@conectaworking.dev';
-- UPDATE public.usuarios SET role = 'empresa', plano_ativo = true WHERE email = 'empresa@conectaworking.dev';