# Repository Guidelines

## Fonte de Verdade (Produto e Engenharia)

Use esta ordem de leitura antes de qualquer implementação:

1. `prd/01-problema-e-objetivo.md` (problema, objetivo, público e escopo).
2. `docs/README.md`, `docs/architecture.md`, `docs/rules.md`, `docs/api-doc.md` para contratos técnicos e limites arquiteturais.

Resumo do PRD: o app digitaliza o ciclo de agendamento + pagamento, reduzindo operação manual e mantendo rastreabilidade financeira para `STUDENT` e `COACH`.

## Estrutura do Projeto e Fronteiras

- `src/app/`: roteamento Expo Router apenas (arquivos finos).
- `src/features/<feature>/`: regra de negócio por feature (`components`, `hooks`, `services`, `types`, `screens`, `index.ts`).
- `src/components/ui/`: única camada autorizada para integrar HeroUI Native.
- `src/components/animations/reacticx/`: componentes de animação reutilizáveis.
- `src/lib/`: infraestrutura compartilhada (auth, api, config, etc.).
- `assets/`: imagens e fontes.
- `docs/`: documentação (diretório na raiz).
- `openspec/`: especificações (diretório na raiz).

## Bibliotecas Principais e Skills Padrão (Agentes)

- Expo/Router (`expo`, `expo-router`, `react-native`): usar `building-native-ui`.
- Auth (`better-auth`, `@better-auth/expo`, `expo-secure-store`): usar `better-auth-best-practices` e `create-auth-skill`.
- UI (`heroui-native`): usar `heroui-native`.
- Estilo (`uniwind`, `tailwindcss`): usar `uniwind` (e `expo-tailwind-setup` em ajustes de setup).
- Animações (`reacticx`, `react-native-reanimated`, `@shopify/react-native-skia`): usar `using-reacticx`.
- Networking/API: usar `native-data-fetching` para qualquer chamada HTTP.

## Comandos de Desenvolvimento

- `npm run start`: inicia o Expo.
- `npm run android`: abre fluxo Android.
- `npm run ios`: abre fluxo iOS.
- `npm run web`: executa no web target.
- `npx tsc --noEmit`: valida TypeScript estrito (gate mínimo em PR).

## Padrões de Código, Testes e PR

- TypeScript estrito; arquivos em kebab-case; hooks com `use<Feature><Intent>`.
- Não fazer chamadas de API em rotas/screens; concentrar em `services`.
- Não importar internals de outra feature; consumir só `index.ts` público.
- Não há suíte de testes oficial ainda; ao adicionar testes, usar `*.test.ts(x)` próximo do módulo.
- Commits em Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`).
- PR deve incluir contexto, arquivos alterados, validação executada e evidência visual para mudanças de UI.
