# DFC Tennis Mobile Rules

## 1. General Rules

- Follow feature-first structure at all times.
- Keep routes in `src/app/` and use it for routing only.
- Keep all application code under `src/`.
- Keep modules cohesive and loosely coupled.
- Prefer small, focused files over broad multi-purpose files.
- Do not introduce architectural shortcuts that bypass module boundaries.

## 2. Routing and Navigation Rules

- Keep route files thin.
- Use route groups `(public)`, `(auth)`, and `(app)`.
- Keep route files under `src/app/`.
- Put navigation wiring in routes, not business behavior.
- Never place business logic in route files.
- Never call backend APIs directly from route files.
- Keep navigation logic shallow and easy to trace.
- Prefer navigation actions in screens or container components.
- Do not pass navigation objects deeply through props.

## 3. Feature Rules

- Organize product behavior under `src/features/<feature-name>/`.
- Keep each feature isolated and self-contained.
- Expose each feature through `index.ts` as its public API.
- Import from other features only through their `index.ts`.
- Never import internal files from another feature directly.
- Put feature business logic in feature hooks and services.
- Keep hooks and services feature-scoped unless they are truly generic.

## 4. Component Rules

- Separate component responsibilities into presentational and container components.
- Presentational components are UI-only.
- Presentational components must receive data and callbacks via props.
- Presentational components must not contain business logic.
- Container components orchestrate hooks and services and compose presentational components.
- Container components must not contain reusable UI primitive logic.
- Do not mix reusable UI concerns and business logic in the same component.

## 5. Hook Rules

- Name hooks with the pattern `use<Feature><Intent>`.
- Hooks should be feature-scoped unless they are truly generic.
- Hooks encapsulate logic and state orchestration only.
- Hooks must not render or call UI components.
- Hooks must call services for API operations.
- Hooks must not call `src/lib/api` clients directly when a service exists.

## 6. Service Rules

- Services are the only layer allowed to call the API client.
- Services must be stateless.
- Services must not contain UI logic.
- Services should return normalized, predictable data contracts for hooks.
- Services must not import screen or route modules.

## 7. API and Error Handling Rules

- Always use the centralized client in `src/lib/api`.
- Keep HTTP concerns (base URL, headers, and transport behavior) in `src/lib/api`.
- Keep API error normalization in `src/lib/api`.
- Call backend endpoints through feature services.
- Never use raw `fetch` in screens, routes, hooks, or shared components.
- Never scatter API calls across unrelated files.
- Hooks handle error decision logic and recovery intent.
- Screens must only display error states and user-facing recovery actions.
- Do not handle raw API errors directly in screens.

## 8. Async State Rules

- Async state (`loading`, `data`, `error`) must be owned by hooks.
- Screens consume async state from hooks.
- Avoid async control flow directly in screens.
- Keep retry/refetch decisions in hooks.

## 9. Screen Rules

- Treat screens as composition layers only.
- Compose UI, hooks, and services in screens; do not implement business rules there.
- Keep screens small and focused on layout, state presentation, and navigation outcomes.
- Never let screens become monolithic files.

## 10. UI and Theme Rules

- Always use UI primitives from `src/components/ui`.
- Treat `src/components/ui` as the only UI-library integration layer.
- Import HeroUI Native only inside `src/components/ui`.
- Never import HeroUI Native directly inside feature modules.
- Keep styling consistent with Uniwind and Hero UI conventions.
- Use `src/components/ui` wrappers as the primary place where theme tokens are applied.
- Avoid styling directly in screens when it can be encapsulated in UI components.
- Always use the default theme tokens from HeroUI Native.
- Do NOT create or introduce custom colors at this stage.
- Do NOT use Tailwind default colors such as yellow, zinc, gray, blue, etc.
- Always use semantic tokens from the theme such as `background`, `foreground`, `content`, `primary`, `secondary`, `success`, `danger`, `focus`, and `border`.
- Components must rely only on semantic tokens and never hardcoded color values.
- Do NOT use inline color values (hex, rgb, oklch, etc).
- Keep components aligned with the HeroUI Native design system so theme changes remain centralized.

## 11. Animation Library Rules

- We use Reacticx for shared animation and micro-interaction components.
- Keep Reacticx components under `src/components/animations/reacticx`.
- Keep Reacticx components separated from HeroUI wrapper components in `src/components/ui`.
- Do not import Reacticx directly in screens or feature modules; consume project-level animation components instead.
- Animation components must remain presentation-focused and must not contain business logic.

## 12. Naming Rules

- Use kebab-case for file names.
- Use clear, domain-oriented names for folders and files.
- Name by intent, not by technical convenience.
- Never use generic names like `utils`, `helpers`, `common`, `misc`, or `stuff` as dumping points.
