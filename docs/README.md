# DFC Tennis Docs

Read order before implementing new screens:

1. `docs/architecture.md`
2. `docs/rules.md`
3. `docs/mobile-web-source-of-truth.md`

Quick pre-implementation checklist:

- Confirm route placement under `src/app/` and keep route files thin.
- Confirm owning feature module under `src/features/<feature>/`.
- Keep API calls in feature services only (via `src/lib/api`).
- Keep async state (`loading/data/error`) inside hooks.
- Use `src/components/ui` for HeroUI-based UI wrappers.
- Use `src/components/animations` for shared animation components.
- Keep Reacticx-specific shared animations in `src/components/animations/reacticx`.
- Use `src/components/onboarding` for shared onboarding primitives (Root/Header/HeaderTitle/Content/Hero/Copy/Footer/FooterCta).
- Use only HeroUI default semantic theme tokens.
- Use `docs/mobile-web-source-of-truth.md` whenever a mobile flow depends on existing web/backend behavior from `C:/Dev/DFC/dfc-tennis`.

Temporary product toggles:

- `2026-04-19`: onboarding was temporarily removed from the authenticated entry flow to speed up app QA while backend integration is unfinished.
- Toggle location: `src/lib/config/onboarding-manual-qa-mode.ts` (`IS_ONBOARDING_MANUAL_QA_MODE_ENABLED = false`).
- Re-enable path later by setting `IS_ONBOARDING_MANUAL_QA_MODE_ENABLED = true` (authenticated users return to `/(public)/onboarding`).
