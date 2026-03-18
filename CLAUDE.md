# Chiara

## Produto
- **O que é:** Assistente pessoal de saúde feminina com IA. Conecta dados de wearables e apps de saúde e entrega recomendações acionáveis no dia a dia via chat.
- **Para quem:** Mulheres brasileiras classe A/B, 25-35 anos, que usam iPhone e se preocupam com saúde preventiva.

## Stack
- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Supabase Edge Functions
- **Banco de dados:** Supabase (Postgres)
- **Autenticação:** Supabase Auth
- **IA:** Claude API (claude-sonnet-4-20250514)
- **Wearables:** Terra API
- **Deploy:** Vercel

## Estrutura de Pastas
src/
├── app/          # Páginas e rotas
├── components/   # Componentes reutilizáveis
├── lib/          # Utilitários e helpers
├── hooks/        # Custom hooks
└── types/        # Tipos TypeScript

## Regras Gerais
- TypeScript estrito — nunca use `any`
- Sempre prefira Server Components; use Client Components só quando necessário
- Nomeie arquivos em kebab-case
- Commits em português, descritivos e pequenos
- Mobile-first sempre
- Nunca suba segredos ou variáveis de ambiente no código

## Agentes

### PM — Orquestrador
Recebe a ideia ou feature, quebra em tarefas pequenas e delega. Não escreve código.

### Frontend
UI, componentes, estilização, experiência do usuário. Sempre mobile-first.

### Backend
API routes, banco de dados, autenticação, lógica de negócio.

### QA
Testa, revisa código, aponta edge cases antes de subir.

## Checklist antes de subir qualquer feature
- [ ] Funciona no mobile
- [ ] Sem erros no console
- [ ] TypeScript sem erros
- [ ] Build passa sem warnings

## Comandos Úteis
npm run dev       # Inicia o servidor local
npm run build     # Build de produção
npm run lint      # Verifica erros de lint