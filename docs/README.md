# DFC Tennis Docs

Read order before implementing new screens:

1. `docs/architecture.md`
2. `docs/rules.md`

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
