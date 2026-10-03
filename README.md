# Jade Açaí

Loja Jade Açaí com cardápio carregado da API, montador de açaí, carrinho com várias configurações por pedido e painel administrativo protegido em `/admin`. O Admin consulta pedidos, atualiza etapas, apresenta indicadores e gerencia itens e combos do catálogo.

## Requisitos

- Node.js compatível com a versão usada pelo projeto (desenvolvimento atual feito com Node 24)
- npm

## Começar

```bash
npm install
npm run dev
```

Abra a URL indicada pelo Next.js (normalmente http://localhost:3000). Se a porta estiver ocupada, o Next escolhe outra porta disponível. O terminal pode avisar que já há outro servidor de desenvolvimento ativo para o mesmo projeto; nesse caso, use a URL do servidor existente.

## Acesso administrativo

Configure estas variáveis no `.env.local` para desenvolvimento e nas Environment Variables do projeto Vercel para produção. `NEXT_PUBLIC_API_URL` é a URL pública da API; as demais credenciais são server-side:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8080
ADMIN_USERNAME=seu-usuario-administrativo
ADMIN_PASSWORD=sua-senha-forte
ADMIN_SESSION_SECRET=chave-aleatoria-com-pelo-menos-32-caracteres
ADMIN_API_KEY=mesma-chave-privada-configurada-no-backend
```

Gere uma chave de sessão com `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`. Use pelo menos 32 caracteres para `ADMIN_API_KEY`; não aplique o prefixo `NEXT_PUBLIC_` a credenciais, nem compartilhe ou versione esses valores. Depois de alterar as variáveis de produção, faça novo deploy do frontend.

O login valida as credenciais no servidor Next.js e cria um cookie assinado, `HttpOnly`, com validade de oito horas. As chamadas administrativas passam por `/admin/api/...`: o Route Handler verifica a sessão e encaminha as chamadas ao backend com `ADMIN_API_KEY`. Configure `NEXT_PUBLIC_API_URL` e as variáveis de sessão no projeto Vercel; configure a mesma `ADMIN_API_KEY` privada também no backend. Nunca use `NEXT_PUBLIC_ADMIN_API_KEY` nem envie a chave ao navegador.

O backend fica no repositório [lpamplonadev/jadeacai-api](https://github.com/lpamplonadev/jadeacai-api). A loja usa `GET /api/v1/menu/catalog` e `POST /api/v1/orders`; o Admin usa endpoints protegidos de dashboard, pedidos e catálogo. Os contratos e os limites atuais estão detalhados em [PROJECT_HANDOFF.md](PROJECT_HANDOFF.md).

## Verificações

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Estrutura principal

- `app/page.tsx`: compõe a loja, carrega o catálogo e controla hero, combo/tamanho selecionado e contador da sacola.
- `app/admin/page.tsx`: login protegido e módulos administrativos de dashboard, pedidos, catálogo e cupons.
- `app/admin/actions.ts`: ações de login e logout no servidor.
- `app/admin/api/[...path]/route.ts`: proxy server-side que verifica a sessão e encaminha métodos administrativos permitidos com `ADMIN_API_KEY`.
- `components/admin/modules/dashboard-module.tsx`: métricas do dia, gráfico por etapa, pedidos recentes, polling e alerta sonoro opcional para novos pedidos.
- `components/admin/modules/orders-module.tsx` e `order-details-dialog.tsx`: lista paginada, filtro, detalhes e alteração de etapas dos pedidos.
- `components/admin/modules/catalog-module.tsx` e `catalog-editor-dialog.tsx`: CRUD administrativo de itens e combos, pausa/reativação, arquivamento e porções de tamanhos mistos.
- `components/admin/modules/order-details-dialog.tsx`: detalhes e tradução dos IDs de itens usando o catálogo Admin atual.
- `app/layout.tsx`: layout raiz, metadados, idioma e fontes Next.
- `app/globals.css`: paleta, tokens Tailwind e estilos globais.
- `components/menu/menu-data.tsx`: tipos e imagens ilustrativas; itens e combos comerciais são carregados do backend.
- `components/menu/product-hero.tsx`: carrossel de quatro campanhas; duas levam à montagem livre e duas ao catálogo.
- `components/menu/product-catalog.tsx`: vitrine ecommerce com busca, categoria, promoção, faixa de preço, ordenação e cards de tamanhos/combos.
- `components/menu/acai-builder.tsx`: configuração de açaís, carrinho em memória, cálculo do pedido, checkout e envio de uma solicitação multi-item à API/WhatsApp.
- `components/menu/acai-builder-data.ts`: tipos de opções do configurador e regras convertidas do catálogo público.
- `components/menu/choice-checklist.tsx`: checklist reutilizável de escolhas múltiplas.
- `components/menu/order-summary.tsx`: linhas removíveis da sacola, total, progresso das porções do combo e barra móvel flutuante.
- `components/menu/combo-limit-dialog.tsx`: confirmação ao ultrapassar inclusão de combo.
- `components/menu/delivery-checkout-form.tsx`: dados de contato/entrega, pagamento, troco e observações.
- `components/menu/brand-footer.tsx`: rodapé da landing.
- `components/menu/site-header.tsx`: cabeçalho, acesso ao Painel Admin e atalho/contador da sacola.
- `components/menu/mobile-navigation.tsx`: navegação móvel antiga, ainda disponível para uma futura experiência logada; não é renderizada pela landing atual.
- `components/ui/`: componentes UI gerados/usados pelo projeto.
- `lib/utils.ts`: utilitários compartilhados, incluindo `cn`.
- `lib/admin-auth.ts`: validação de credenciais e sessão administrativa assinada.
- `lib/jade-api.ts`: cliente da API pública, conversão do catálogo e payload multi-item.
- `public/`: arquivos estáticos locais.

Para regras de negócio, fluxo de compra, convenções visuais, pendências e integração futura com API/Admin, consulte [PROJECT_HANDOFF.md](PROJECT_HANDOFF.md).

O carrinho reúne até 100 configurações de açaí por pedido. Combos podem agrupar vários tamanhos; cada copo é configurado individualmente e aparece como uma linha própria da sacola. Complementos continuam sendo escolhas dentro do açaí, não produtos avulsos.

## Observações

- `npm run dev` inicia o servidor Next em modo de desenvolvimento.
- As imagens remotas usam `images.unsplash.com`, permitido em `next.config.ts`.
- Há um aviso automático de instruções do Next 16 em `AGENTS.md`. Consulte a documentação instalada em `node_modules/next/dist/docs/` antes de usar APIs ou padrões específicos do framework.
