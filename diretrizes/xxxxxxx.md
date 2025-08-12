PS H:\Programação\saas-starter> npm run build

> prebuild
> npm run validate:env


> validate:env
> tsx scripts/validate-env.ts

🔍 Validando variáveis de ambiente...

✅ Variáveis obrigatórias:
   - DATABASE_URL: Configurado
   - AUTH_SECRET: Configurado
   - BASE_URL: http://localhost:3000

📦 Variáveis opcionais:
   - Stripe: Configurado
   - Redis: Não configurado (usando cache em memória)

🔌 Testando conexão com banco de dados...
✅ Conexão com banco estabelecida!

✨ Ambiente validado com sucesso!

> build
> next build

   ▲ Next.js 15.4.0-canary.47
   - Environments: .env
   - Experiments (use with caution):
     ✓ ppr
     ✓ nodeMiddleware
     ✓ clientSegmentCache

   Creating an optimized production build ...
 ✓ Compiled successfully in 43s
 ✓ Linting and checking validity of types    
   Collecting page data  ..⚠️ Cache Manager: Using Memory provider (Redis not configured)
⚠️ Cache Manager: Using Memory provider (Redis not configured)
⚠️ Cache Manager: Using Memory provider (Redis not configured)
⚠️ Cache Manager: Using Memory provider (Redis not configured)
⚠️ Cache Manager: Using Memory provider (Redis not configured)
 ✓ Collecting page data    
⚠️ Cache Manager: Using Memory provider (Redis not configured)
Error getting current user: Error: Route /bookings/sync needs to bail out of prerendering at this point because it used cookies. React throws this special object to indicate where. It should not be caught by your own try/catch. Learn more: https://nextjs.org/docs/messages/ppr-caught-error
    at z (H:\Programação\saas-starter\.next\server\chunks\2111.js:1:70304)
    at m (H:\Programação\saas-starter\.next\server\chunks\3026.js:27:50952)
    at r (H:\Programação\saas-starter\.next\server\chunks\7048.js:1:6934)
    at t (H:\Programação\saas-starter\.next\server\chunks\7048.js:1:7414)
    at i (H:\Programação\saas-starter\.next\server\app\(dashboard)\bookings\sync\page.js:1:470) {
  '$$typeof': Symbol(react.postpone)
}
⚠️ Cache Manager: Using Memory provider (Redis not configured)
⚠️ Cache Manager: Using Memory provider (Redis not configured)
 ✓ Generating static pages (52/52)
 ✓ Collecting build traces    
 ✓ Finalizing page optimization

Route (app)                                 Size  First Load JS  Revalidate  Expire
┌ ƒ /                                      763 B         126 kB
├ ○ /_not-found                            323 B         122 kB
├ ƒ /api/agency                            204 B         122 kB
├ ƒ /api/auth/logout                       204 B         122 kB
├ ƒ /api/clients                           204 B         122 kB
├ ƒ /api/clients/[id]                      204 B         122 kB
├ ƒ /api/clients/check-document            204 B         122 kB
├ ƒ /api/clients/check-email               204 B         122 kB
├ ƒ /api/clients/filters                   204 B         122 kB
├ ƒ /api/csrf-token                        204 B         122 kB
├ ƒ /api/interactions                      204 B         122 kB
├ ƒ /api/operators                         204 B         122 kB
├ ƒ /api/operators/[operatorId]/items      204 B         122 kB
├ ƒ /api/proposals                         204 B         122 kB
├ ƒ /api/proposals/[proposalId]/history    204 B         122 kB
├ ƒ /api/proposals/expire                  204 B         122 kB
├ ƒ /api/stripe/checkout                   204 B         122 kB
├ ƒ /api/stripe/webhook                    204 B         122 kB
├ ƒ /api/tasks                             204 B         122 kB
├ ƒ /api/tasks/[id]                        204 B         122 kB
├ ƒ /api/tasks/test                        204 B         122 kB
├ ƒ /api/team                              204 B         122 kB
├ ƒ /api/test-bookings                     204 B         122 kB
├ ƒ /api/user                              204 B         122 kB
├ ƒ /api/users                             204 B         122 kB
├ ƒ /bookings                            2.54 kB         128 kB
├ ◐ /bookings/[bookingId]                2.02 kB         127 kB
├   └ /bookings/[bookingId]
├ ○ /bookings/sync                       1.33 kB         123 kB
├ ƒ /catalog                             5.83 kB         153 kB
├ ◐ /catalog/[id]                        6.99 kB         151 kB
├   └ /catalog/[id]
├ ƒ /clients                             11.2 kB         161 kB
├ ◐ /clients/[id]                        18.6 kB         187 kB
├   └ /clients/[id]
├ ◐ /clients/[id]/edit                    2.5 kB         175 kB
├   └ /clients/[id]/edit
├ ○ /clients/new                            1 kB         174 kB
├ ƒ /demo                                1.03 kB         126 kB
├ ○ /funnels                             7.94 kB         148 kB
├ ◐ /funnels/[funnelId]                  7.18 kB         138 kB
├   └ /funnels/[funnelId]
├ ƒ /operators                            4.8 kB         218 kB
├ ◐ /operators/[operatorId]              13.8 kB         224 kB
├   └ /operators/[operatorId]
├ ○ /pricing                             1.41 kB         133 kB          1h      1y
├ ƒ /profile                             6.62 kB         209 kB
├ ○ /proposals                           4.98 kB         139 kB
├ ◐ /proposals/[proposalId]              21.4 kB         207 kB
├   └ /proposals/[proposalId]
├ ◐ /proposals/[proposalId]/contract     7.77 kB         242 kB
├   └ /proposals/[proposalId]/contract
├ ○ /proposals/new                        5.2 kB         146 kB
├ ○ /reports                               395 B         122 kB
├ ƒ /settings                            8.56 kB         211 kB
├ ○ /sign-in                               162 B         169 kB
├ ○ /sign-up                               161 B         169 kB
├ ○ /style-demo                          5.52 kB         137 kB
├ ƒ /test-bookings                         176 B         125 kB
├ ○ /test-modals                         7.37 kB         174 kB
└ ƒ /users                               14.8 kB         247 kB
+ First Load JS shared by all             122 kB
  ├ chunks/3ad3f82a-2e7d1bbd52353191.js  63.7 kB
  ├ chunks/4559-f252dc89a5e29440.js      55.7 kB
  └ other shared chunks (total)           2.3 kB


○  (Static)             prerendered as static content
◐  (Partial Prerender)  prerendered as static HTML with dynamic server-streamed content
ƒ  (Dynamic)            server-rendered on demand