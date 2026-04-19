# Mobile/Web Source of Truth

This mobile app (`C:/Dev/DFC/dfc-tennis-mobile`) depends on the web/backend project at `C:/Dev/DFC/dfc-tennis` as the canonical source of truth for:

- domain rules
- authenticated student/coach behavior
- API contracts
- booking, wallet, profile, and notification semantics

Use the mobile repository to reinterpret UX for native surfaces. Do not treat the web project as a source of final mobile layout decisions.

## How To Use This Document

Before implementing a core mobile screen:

1. Read the relevant API contract in [api-reference-doc.md](/C:/Dev/DFC/dfc-tennis-mobile/docs/api-reference-doc.md).
2. Inspect the matching web route, feature component, and domain loader/use case listed below.
3. Reuse domain semantics and data shapes.
4. Rebuild the UI for mobile-first interaction instead of copying desktop/PWA structure.

## Cross-Repo Mapping

### Home / Feed

- Mobile feature target: `src/features/home`
- Web route entry: `C:/Dev/DFC/dfc-tennis/app/(app)/inicio/page.tsx`
- Web page composition: `C:/Dev/DFC/dfc-tennis/features/home/pages/home-page.tsx`
- Web feed container: `C:/Dev/DFC/dfc-tennis/features/home/components/slot-feed-snap-container.tsx`
- Web feed card: `C:/Dev/DFC/dfc-tennis/features/home/components/slot-feed-card.tsx`
- Web feed hook: `C:/Dev/DFC/dfc-tennis/features/home/hooks/use-home-feed.ts`
- Web API route: `C:/Dev/DFC/dfc-tennis/app/api/slots/feed/route.ts`
- Backend use case: `C:/Dev/DFC/dfc-tennis/lib/application/slots.ts`
- Legacy server loader reference: `C:/Dev/DFC/dfc-tennis/lib/server/loaders/student-home.ts`
- Shared visual helper reference: `C:/Dev/DFC/dfc-tennis/lib/adapters/home-feed-adapter.ts`

### Class Detail

- Mobile feature target: `src/features/class-detail`
- Web route entry: `C:/Dev/DFC/dfc-tennis/app/(app)/aula/[id]/page.tsx`
- Web page shell: `C:/Dev/DFC/dfc-tennis/features/class-detail/components/student-class-detail-premium-page.tsx`
- Web hero: `C:/Dev/DFC/dfc-tennis/features/class-detail/components/class-detail-hero.tsx`
- Web sticky CTA: `C:/Dev/DFC/dfc-tennis/features/class-detail/components/class-detail-bottom-cta.tsx`
- Web collapsible header: `C:/Dev/DFC/dfc-tennis/features/class-detail/components/class-detail-collapsible-header.tsx`
- Web data adapter: `C:/Dev/DFC/dfc-tennis/features/class-detail/adapters/class-detail-view-model.ts`
- Backend loader: `C:/Dev/DFC/dfc-tennis/lib/server/loaders/student-class-detail.ts`
- Booking domain helpers: `C:/Dev/DFC/dfc-tennis/lib/constants/booking-status.ts`
- Scheduling policy: `C:/Dev/DFC/dfc-tennis/lib/schedule-policy.ts`

### Account / Profile / Wallet

- Mobile feature target: `src/features/account`
- Web route entry: `C:/Dev/DFC/dfc-tennis/app/(app)/conta/page.tsx`
- Web account page: `C:/Dev/DFC/dfc-tennis/components/account/account-telegram-page.tsx`
- Web wallet route: `C:/Dev/DFC/dfc-tennis/app/(app)/conta/carteira/page.tsx`
- Web profile routes: `C:/Dev/DFC/dfc-tennis/app/(app)/conta/perfil/page.tsx`
- Web profile API route: `C:/Dev/DFC/dfc-tennis/app/api/me/profile/route.ts`
- Web wallet API route: `C:/Dev/DFC/dfc-tennis/app/api/wallet/me/route.ts`
- Backend profile use case: `C:/Dev/DFC/dfc-tennis/lib/application/profile.ts`
- Backend wallet use case: `C:/Dev/DFC/dfc-tennis/lib/application/wallet.ts`
- Domain adapters: `C:/Dev/DFC/dfc-tennis/lib/adapters/profile-adapter.ts`, `C:/Dev/DFC/dfc-tennis/lib/adapters/wallet-adapter.ts`

### Header System

- Mobile architecture target: `src/components/ui/header.tsx` + `src/features/app-shell/*`
- Web student header: `C:/Dev/DFC/dfc-tennis/components/layout/global-header.tsx`
- Web coach header reference: `C:/Dev/DFC/dfc-tennis/components/layout/coach-header.tsx`
- Notification settings helper: `C:/Dev/DFC/dfc-tennis/components/layout/notification-header-actions.ts`
- Layout constants reference: `C:/Dev/DFC/dfc-tennis/features/layout/constants.ts`

### Bottom Navigation

- Mobile architecture target: `src/components/ui/bottom-nav.tsx` + `src/features/app-shell/*`
- Web student bottom nav: `C:/Dev/DFC/dfc-tennis/components/layout/bottom-nav.tsx`
- Web coach bottom nav reference: `C:/Dev/DFC/dfc-tennis/components/layout/coach-bottom-nav.tsx`
- Floating variation reference: `C:/Dev/DFC/dfc-tennis/components/layout/floating-bottom-nav.tsx`

### Notifications / Agenda / Agendar

- Mobile initial delivery: EmptyState placeholders
- Web notifications route: `C:/Dev/DFC/dfc-tennis/app/(app)/notificacoes/page.tsx`
- Web agenda route: `C:/Dev/DFC/dfc-tennis/app/(app)/agenda/page.tsx`
- Web agendar route: `C:/Dev/DFC/dfc-tennis/app/(app)/agendar/page.tsx`
- Notification API route: `C:/Dev/DFC/dfc-tennis/app/api/notifications/route.ts`

## API Contract References

- Mobile API summary: `C:/Dev/DFC/dfc-tennis-mobile/docs/api-reference-doc.md`
- Web API auth handling: `C:/Dev/DFC/dfc-tennis/lib/api/auth.ts`
- Better Auth server config with Expo + bearer support: `C:/Dev/DFC/dfc-tennis/lib/auth.ts`

## Implementation Guardrails

- Routes stay thin in `src/app/`.
- Feature behavior stays inside `src/features/<feature>/`.
- Only `src/components/ui/` may integrate HeroUI Native directly.
- Header and BottomNav primitives must remain role-agnostic.
- Student/Coach variation belongs in config and wrappers, never in primitives.
- Mobile UX must preserve domain truth while reinterpreting layout natively.

## Temporary Alignment Note (2026-04-19)

Home feed is intentionally running in a temporary PWA-parity mode while backend/integration tasks continue:

- Home filters (`Tudo`, `Minhas aulas`, `Disponíveis`) are hidden in mobile.
- Welcome/title copy (`Bem-vindo`, `Seu feed de aulas`) is hidden in mobile.
- Home uses reels-style snap (`1 card por viewport`) with floating in-banner header (logo + action button).
- Bottom nav is fixed and icon-only, with real user avatar on profile tab.

When backend integration is complete, revisit this section before reintroducing filter logic in mobile Home.
