# Architecture

The frontend is organized by feature and layer. `app/` contains Next.js route entrypoints; feature code lives outside the routing tree so URL conventions remain separate from product behavior.

## Layers

- `app/`: thin App Router pages, Server Actions, and Route Handlers. Route files adapt Next.js requests to feature modules.
- `features/storefront/domain`: menu, catalog, order, and builder contracts/data that do not depend on React or Next.js.
- `features/storefront/application`: catalog mapping and storefront use-case logic.
- `features/storefront/infrastructure`: public API and ViaCEP HTTP adapters.
- `features/storefront/presentation`: storefront composition and React UI.
- `features/admin/domain`: order and catalog models/statuses.
- `features/admin/application`: auth use cases and pure presentation/application helpers.
- `features/admin/infrastructure`: browser API client, signed-session adapter, Server Actions, backend proxy, and Supabase image upload.
- `features/admin/presentation`: Admin page and React modules.
- `shared/ui` and `shared/lib`: framework-facing UI primitives and generic utilities reused by features.

## Change Rules

- Keep route conventions in `app/`; do not put feature UI or business rules in route handlers.
- Keep domain modules free of React, Next.js, and network calls.
- Keep server-only secrets and session/storage operations in Admin infrastructure; never expose them to client components.
- Keep catalog conversion in storefront application code and network details in infrastructure adapters.
- Keep UI-specific behavior in presentation and shared primitives genuinely reusable.

Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` after frontend changes.
