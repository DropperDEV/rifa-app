# Configuração do Supabase - Autenticação Sem E-mail

Este documento descreve as configurações necessárias no Supabase Dashboard para remover completamente a dependência de e-mails no sistema de autenticação.

## 🎯 Objetivo

Eliminar todos os envios de e-mail (OTP, reset de senha, confirmação) para evitar:
- Rate limits (`email rate limit exceeded`)
- Erros de sessão (`Session was issued in the future`)
- Dependência de SMTP

## 📋 Configurações no Supabase Dashboard

### 1. Desabilitar Confirmação de E-mail

1. Acesse **Authentication** → **Settings** no Supabase Dashboard
2. Na seção **Email Auth**, encontre **"Enable email confirmations"**
3. **DESABILITE** esta opção (toggle OFF)
4. Isso permite que novos usuários usem a conta imediatamente após o signup

### 2. Desabilitar Magic Link (OTP)

1. Em **Authentication** → **Settings**
2. Na seção **Email Auth**, encontre **"Enable magic link"**
3. **DESABILITE** esta opção (toggle OFF)
4. Isso remove a opção de login sem senha

### 3. Desabilitar Reset de Senha por E-mail

1. Em **Authentication** → **Settings**
2. Na seção **Email Auth**, encontre **"Enable password reset"**
3. **DESABILITE** esta opção (toggle OFF)
4. **Nota:** Para ambientes internos, considere criar um fluxo administrativo para reset de senha

### 4. Configurar Rate Limits (Opcional mas Recomendado)

1. Em **Authentication** → **Settings**
2. Role até **"Rate Limits"**
3. Ajuste os limites conforme necessário:
   - **Email sending rate limit**: Aumente ou desabilite se possível
   - **Signup rate limit**: Ajuste para seu ambiente

### 5. Configurar Redirect URLs (Se necessário)

1. Em **Authentication** → **URL Configuration**
2. Adicione suas URLs permitidas:
   - `http://localhost:5173` (desenvolvimento)
   - `https://seu-dominio.com` (produção)
   - URLs do Capacitor (Android/iOS): `capacitor://localhost`, `ionic://localhost`

## 🔐 Estratégia de Autenticação Implementada

### Login Direto com Senha

- Usuários fazem login diretamente com `email + senha`
- Não há confirmação de e-mail necessária
- Contas são ativadas imediatamente após criação

### Convites de Vendedores

- Convites são criados na tabela `convites_rifa`
- Usuários veem convites pendentes na dashboard (`MeusConvites`)
- Não há envio de e-mail - tudo é gerenciado via interface

### Controle de Acesso

- RLS (Row Level Security) controla acesso aos dados
- Tabelas próprias (`rifa_vendedores`, `convites_rifa`) gerenciam permissões
- Supabase Auth apenas fornece identidade (user_id)

## ⚠️ Pontos de Atenção de Segurança

### 1. Senhas Fortes

- **Recomendação:** Implemente validação de senha forte no frontend
- Mínimo 8 caracteres, com maiúsculas, minúsculas, números e símbolos
- Considere usar bibliotecas como `zod` ou `yup` para validação

### 2. Rate Limiting no Frontend

- Implemente rate limiting no próprio frontend para prevenir ataques de força bruta
- Adicione delays entre tentativas de login
- Considere usar CAPTCHA após múltiplas tentativas

### 3. Gerenciamento de Senhas

- **Problema:** Sem reset por e-mail, usuários podem ficar bloqueados
- **Solução:** Crie um painel administrativo para reset de senhas
- Ou implemente perguntas de segurança (menos seguro)

### 4. Auditoria

- Monitore tentativas de login falhadas
- Use os logs do Supabase (`Authentication` → `Logs`)
- Considere criar uma tabela de auditoria própria

### 5. Sessões

- Configure tempo de expiração de sessão adequado
- Em **Authentication** → **Settings** → **Session Management**
- Recomendado: 1-7 dias para ambientes internos

## 🔄 Fluxo de Trabalho Recomendado

### Para Ambientes Internos/Corporativos

1. **Criação de Usuários:**
   - Admin cria usuários via interface administrativa
   - Ou usuários se cadastram diretamente (se permitido)
   - Senha inicial pode ser definida pelo admin ou pelo próprio usuário

2. **Gerenciamento de Acesso:**
   - Use tabelas próprias para controlar permissões
   - RLS garante que usuários só vejam seus próprios dados
   - Convites gerenciam acesso a equipes/rifas

3. **Recuperação de Senha:**
   - Opção 1: Painel administrativo (recomendado)
   - Opção 2: Perguntas de segurança (menos seguro)
   - Opção 3: Contato direto com administrador

## 📝 Checklist de Implementação

- [x] Removido `signInWithOtp` do código
- [x] Removido `resetPasswordForEmail` do código
- [x] Removido modo "magic link" do LoginPage
- [x] Removida rota `/forgot-password`
- [x] Ajustado `signUp` para não exigir confirmação
- [x] Removido envio de e-mail nos convites
- [ ] **Configurar Supabase Dashboard** (siga este guia)
- [ ] Testar criação de novos usuários
- [ ] Testar login direto
- [ ] Testar fluxo de convites
- [ ] Implementar validação de senha forte
- [ ] Criar painel administrativo (opcional)

## 🚀 Próximos Passos

1. Acesse o Supabase Dashboard e aplique as configurações acima
2. Teste o fluxo completo de autenticação
3. Monitore logs para garantir que não há mais tentativas de envio de e-mail
4. Considere implementar um sistema de recuperação de senha alternativo

## 📚 Referências

- [Supabase Auth Settings](https://supabase.com/docs/guides/auth/auth-settings)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Rate Limits](https://supabase.com/docs/guides/platform/rate-limits)
