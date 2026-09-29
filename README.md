# Jade Açaí

Landing page de combos e montagem personalizada de açaí, integrada à API para carregar o catálogo e registrar pedidos. A rota `/admin` contém o acesso protegido e a primeira estrutura do painel; métricas e gestão de pedidos aguardam endpoints administrativos no backend.

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

Configure estas variáveis privadas no `.env.local` para desenvolvimento e no ambiente do serviço frontend no Render para produção:

```dotenv
ADMIN_USERNAME=seu-usuario-administrativo
ADMIN_PASSWORD=sua-senha-forte
ADMIN_SESSION_SECRET=chave-aleatoria-com-pelo-menos-32-caracteres
```

Gere uma chave de sessão com `node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"`. Não use o prefixo `NEXT_PUBLIC_` nem compartilhe ou versione essas credenciais. Depois de alterar as variáveis de produção, faça novo deploy do frontend.

O login valida as credenciais no servidor Next.js e cria um cookie assinado, `HttpOnly`, com validade de oito horas. Isso protege a interface `/admin`; antes de conectar dados administrativos, a API também precisa autenticar e autorizar as rotas de leitura e alteração. CORS sozinho não substitui autenticação.

## Verificações

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Estrutura principal

- `app/page.tsx`: compõe a landing e controla o slide da hero e o combo selecionado.
- `app/admin/page.tsx`: login protegido e dashboard administrativo inicial.
- `app/admin/actions.ts`: ações de login e logout no servidor.
- `app/layout.tsx`: layout raiz, metadados, idioma e fontes Next.
- `app/globals.css`: paleta, tokens Tailwind e estilos globais.
- `components/menu/menu-data.tsx`: produtos usados na hero e combos exibidos no catálogo.
- `components/menu/product-hero.tsx`: carrossel de quatro campanhas; duas levam à montagem livre e duas ao catálogo.
- `components/menu/product-catalog.tsx`: cards dos combos e seleção de combo para personalização.
- `components/menu/acai-builder.tsx`: estado, cálculo, regras do combo, formulário em duas etapas e criação da mensagem do pedido.
- `components/menu/acai-builder-data.ts`: opções, preços, limites, taxa de entrega, WhatsApp e conversão de combo em tamanho de copo.
- `components/menu/choice-checklist.tsx`: checklist reutilizável de escolhas múltiplas.
- `components/menu/order-summary.tsx`: resumo, total e barra móvel flutuante.
- `components/menu/combo-limit-dialog.tsx`: confirmação ao ultrapassar inclusão de combo.
- `components/menu/delivery-checkout-form.tsx`: dados de contato/entrega, pagamento, troco e observações.
- `components/menu/brand-footer.tsx`: rodapé da landing.
- `components/menu/site-header.tsx`: cabeçalho da landing.
- `components/menu/mobile-navigation.tsx`: navegação móvel antiga, ainda disponível para uma futura experiência logada; não é renderizada pela landing atual.
- `components/ui/`: componentes UI gerados/usados pelo projeto.
- `lib/utils.ts`: utilitários compartilhados, incluindo `cn`.
- `lib/admin-auth.ts`: validação de credenciais e sessão administrativa assinada.
- `public/`: arquivos estáticos locais.

Para regras de negócio, fluxo de compra, convenções visuais, pendências e integração futura com API/Admin, consulte [PROJECT_HANDOFF.md](PROJECT_HANDOFF.md).

## Observações

- `npm run dev` inicia o servidor Next em modo de desenvolvimento.
- As imagens remotas usam `images.unsplash.com`, permitido em `next.config.ts`.
- Há um aviso automático de instruções do Next 16 em `AGENTS.md`. Consulte a documentação instalada em `node_modules/next/dist/docs/` antes de usar APIs ou padrões específicos do framework.
