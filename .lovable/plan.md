## Visão geral

Construir uma plataforma de cursos inspirada no visual do vibecodeflix.com.br (tema escuro, vermelho/preto, estilo Netflix), com landing pública, autenticação real, área de membros com player de vídeo, e painel admin para cadastrar cursos. Vou usar o nome **CreatorsFLIX** e o esquema vermelho/preto enquanto você não disser o contrário (você pode renomear depois).

> Importante: vou clonar o **visual e a estrutura**, não copiar textos/imagens proprietárias. Conteúdos serão reescritos / placeholders.

## O que será construído

### 1. Design system (estilo Netflix)
- Tema escuro permanente, paleta preto + vermelho vibrante
- Tipografia bold para títulos (estilo display), sans-serif limpa para corpo
- Tokens em `src/styles.css` (oklch), nada de cores hardcoded
- Cards com hover scale, gradientes sutis, glow vermelho

### 2. Landing pública (`/`)
- Header fixo com logo CreatorsFLIX + botão Login
- Hero com CTA principal
- Seção "Por que escolher" (grid de features)
- Stats (200+ criadores, etc.)
- Seção de pricing (3 planos)
- Footer

### 3. Autenticação (Lovable Cloud)
- `/login` — email + senha + Google
- `/signup` — cadastro
- Rota `_authenticated` protegendo área de membros
- Tabela `profiles` ligada a `auth.users` (nome, avatar)
- Tabela `user_roles` separada (enum: `admin`, `student`) para evitar privilege escalation
- Função `has_role()` security definer

### 4. Área de membros
- `/meus-cursos` — grid estilo Netflix com os cursos do usuário (carrosséis por categoria)
- `/curso/$id` — página do curso com lista de aulas (sidebar) + player principal
- `/curso/$id/aula/$aulaId` — player de vídeo (HTML5 / iframe YouTube/Vimeo) + descrição + marcação de progresso

### 5. Painel admin (`/admin`)
- Apenas para `role = admin`
- CRUD de cursos (título, descrição, capa, categoria)
- CRUD de aulas (título, URL do vídeo, ordem, duração)
- Gerenciar matrículas de alunos

### 6. Banco de dados (schema)

```text
profiles (id → auth.users, full_name, avatar_url)
user_roles (id, user_id, role enum)
courses (id, title, description, cover_url, category, created_at)
lessons (id, course_id, title, video_url, position, duration_seconds)
enrollments (id, user_id, course_id, enrolled_at)
lesson_progress (id, user_id, lesson_id, completed, watched_seconds)
```
Todas com RLS: aluno vê só seus dados; admin vê tudo via `has_role()`.

## Detalhes técnicos
- TanStack Start + file-based routing
- Lovable Cloud (Supabase) para auth + DB + storage de capas
- Server functions (`createServerFn`) para queries protegidas
- Player: `<video>` HTML5 para URLs diretas; suporte a embed YouTube/Vimeo via iframe
- Imagens de capa: gerar 4-6 placeholders com imagegen para semear cursos demo

## Entrega faseada (recomendo aprovar uma por vez)

**Fase 1 (esta entrega):** Design system + landing pública + login/signup + estrutura da área de membros com dados mockados.

**Fase 2:** Banco de dados + matrículas + player de vídeo funcional + progresso.

**Fase 3:** Painel admin completo (CRUD cursos/aulas) + upload de capas.

Faço a Fase 1 agora e seguimos iterando — assim você valida o visual antes de eu construir o backend todo. Pode aprovar?
