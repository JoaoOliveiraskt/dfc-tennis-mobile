# DFC Tennis Mobile Architecture

## 1. Overview

This architecture defines a feature-first, modular structure for the DFC Tennis mobile app using Expo and React Native. It exists to keep MVP delivery fast while protecting long-term maintainability, clear ownership, and low coupling as new flows are added.

Core intent:

- Keep routing thin and predictable.
- Isolate feature business logic inside feature modules.
- Keep UI library usage replaceable through a single abstraction layer.
- Centralize API access and error handling.

## 2. Folder Structure

Top-level structure:

- `src/app/`: Expo Router route files only.
- `src/features/`: feature modules (domain/business flows).
- `src/components/`: shared components, including UI wrappers.
- `src/components/animations/reacticx/`: animation-focused shared components powered by Reacticx.
- `src/lib/`: cross-cutting infrastructure (api, config, env, storage, constants).
- `src/hooks/`: generic reusable hooks only.
- `docs/`: architecture and engineering guardrails.

Critical boundary rule:

- Routing MUST live in `src/app/` for this project standard.
- Do not create a second routing root at repository `app/`.
- All application code (features, components, lib, hooks) MUST live under `src/`.
- `src/app/` is routing only; the rest of `src/` is application code.

Naming conventions:

- Files: kebab-case.
- Folders: feature-oriented, domain-intent names.
- Do not create generic dumping folders such as `common`, `utils`, `helpers`, `misc`, or `stuff`.
- `types` and `helpers` are allowed only when scoped by domain (`<feature>/types`, `<feature>/helpers`) or when clearly cross-feature (`src/lib/types`).

## 3. Feature Architecture

Each feature is self-contained at `src/features/<feature>/` with:

- `components/`: feature-specific UI components (presentational and container composition).
- `hooks/`: feature-specific behavior and orchestration hooks.
- `services/`: feature data/business service operations.
- `types/`: feature-local types/contracts.
- `screens/`: composition-only screen containers.
- `index.ts`: feature public API.

Rules:

- Each feature MUST expose a public API via `index.ts`.
- External code MUST NOT import internal files from another feature directly.
- Cross-feature communication MUST use:
  - feature public APIs, or
  - shared layers (`src/lib`, `src/components`, `src/hooks`).
- Component separation MUST be explicit:
  - presentational components are UI-only and receive all data via props,
  - container components orchestrate hooks/services and compose presentational UI,
  - UI and business logic MUST NOT be mixed in the same component.
- Hooks should be feature-scoped unless they are truly generic.
- Hook names should follow `use<Feature><Intent>` for discoverability and consistency.

Feature entry/composition contract:

- Route files should import feature screens through feature `index.ts` when available.
- Feature `index.ts` should export only stable entry points (screen containers, public hooks/types).
- Do not re-export entire feature internals from `index.ts`.

Type ownership:

- Feature-local contracts belong in `src/features/<feature>/types`.
- Shared contracts belong in `src/lib/types` only when reused by multiple features.
- Do not promote types to shared scope before real multi-feature reuse exists.

## 4. Routing Strategy

Expo Router uses route groups:

- `(public)`
- `(auth)`
- `(app)`

Thin-route concept:

- Route files are wiring/composition only.
- Routes MUST NOT contain business logic or direct API orchestration.
- Routes delegate to feature screens/hooks/services.
- Routes should not import feature internals directly when a feature public API exists.
- Navigation logic must stay shallow and predictable:
  - prefer navigation actions in routes, screens, or container components,
  - do not pass navigation objects deeply through props.

## 5. UI Architecture

UI abstraction is centralized in `src/components/ui/`.

Rules:

- Features and screens import UI primitives only from `src/components/ui`.
- Only `src/components/ui` may import HeroUI Native.
- UI wrappers use consistent Uniwind styling conventions.
- Keep wrappers replaceable so HeroUI can be swapped without feature rewrites.
- Theme tokens should be applied primarily in `src/components/ui` wrappers.
- Screens should avoid direct styling when it can be encapsulated in reusable UI wrappers.
- `src/components/` is for cross-feature reusable UI building blocks only.
- Feature-specific UI belongs in `src/features/<feature>/components`.

## 5.1 Animation Components

Animation-focused shared components use Reacticx and live in `src/components/animations/reacticx/`.

Rules:

- Reacticx components are dedicated to animation and interaction effects, not domain logic.
- Reacticx components MUST stay separated from HeroUI wrapper components.
- Features and screens should consume animation components through local project paths, not directly from the Reacticx package.
- Animation components must remain reusable and presentation-oriented.

## 6. API Layer

API access is centralized in `src/lib/api/`:

- `client.ts`: request abstraction and base URL handling.
- `errors.ts`: normalized error model.
- `types.ts`: shared API contracts.

Rules:

- No raw `fetch` in routes, screens, or random components.
- Feature services are the only layer allowed to call the centralized API client.
- Services must be stateless and free of UI logic.
- Services should return normalized data contracts that hooks can consume safely.
- When API response shape differs from screen needs, mapping/adapter logic belongs in feature services (or feature-local mapper files under `services/`).
- API layer must remain ready for:
  - auth token injection (future Better Auth strategy),
  - TanStack Query integration for server state.
- API errors must be normalized in `src/lib/api/errors.ts` before they reach features.
- Screens must never normalize or interpret raw API errors directly.

## 7. State Strategy

State approach is local-first:

- Prefer local component and feature hooks for current MVP scope.
- Avoid premature global state.
- Keep boundaries ready for TanStack Query adoption when server-state complexity grows.
- Server state boundaries (future-ready):
  - services remain the source of API interaction,
  - hooks own async orchestration and derived state,
  - screens stay render-only for loading/data/error outputs.
- Async flow ownership:
  - hooks own loading/data/error state and async orchestration,
  - screens consume hook outputs and render states only,
  - screens should avoid direct async control flow and API error handling.

Form and validation boundaries:

- Validation schemas/rules should live close to the owning feature (usually in `src/features/<feature>/types` or a feature-local validation file).
- Screens trigger submit/cancel UX; validation decision logic stays in feature hooks/services.
- Shared validation rules should only move to `src/lib` after confirmed cross-feature reuse.

## 8. Dependency Rules

Allowed directions:

- `src/app` -> `src/features`, `src/components`, `src/lib`
- `src/features` -> own internals, `src/components/ui`, `src/components/animations`, `src/lib`, `src/hooks`
- `src/components/ui` -> HeroUI Native + shared styling utilities
- `src/components/animations/reacticx` -> Reacticx + animation dependencies
- `src/hooks` -> `src/lib` and other generic hooks only

Forbidden patterns:

- Cross-feature internal imports.
- Direct HeroUI imports outside `src/components/ui`.
- Direct Reacticx imports outside `src/components/animations/reacticx`.
- Business logic in route files.
- API calls outside `src/lib/api` + feature services.
- Scattered `fetch` calls in screens/components.
- Monolithic screens mixing UI, domain logic, and API orchestration.

## 9. How to Add a New Screen

1. Create or confirm the owning feature module under `src/features/<feature>/`.
2. Add/update feature hooks for screen behavior in `hooks/`.
3. Add/update feature services for API/domain operations in `services/`.
4. Build a composition-only screen container in `screens/`.
5. Use shared UI wrappers from `src/components/ui` only.
6. Export what is needed through the feature `index.ts` public API.
7. Add a thin route entry in `src/app/` under the correct route group.
8. Verify no business logic in route files and no direct API calls outside approved layers.

## 10. Testing Strategy

Layer-focused and lightweight:

- Services: unit-test request shaping, response normalization, and error mapping.
- Hooks: test async state transitions (`loading`, `data`, `error`) and interaction with services.
- Screen containers: test composition and state rendering decisions, not low-level UI internals.
- UI wrappers/animation components: test behavior only where regressions are likely; avoid snapshot overuse.

## 11. Anti-Patterns

Never do the following:

- Direct HeroUI usage inside feature modules.
- Business logic inside screens or routes.
- Cross-feature imports of internal files.
- Scattered `fetch` or API calls from random components/screens.
- Dumping unrelated helpers/types into global shared folders.
- Generic dumping folders like `common`, `utils`, `helpers`, `misc`, or `stuff`.
- Large monolithic files that mix multiple responsibilities.

### 12. Theme Rules

- Always use the default theme tokens from HeroUI Native.

- Do NOT create or introduce custom colors at this stage.

- Do NOT use Tailwind default colors such as:
  - yellow
  - zinc
  - gray
  - blue
  - etc

- Always use semantic tokens provided by the theme, such as:
  - background
  - foreground
  - content (surface equivalents)
  - primary
  - secondary
  - success
  - danger
  - focus
  - border

- Components must rely only on these semantic tokens and never hardcoded color values.

- Do NOT use inline color values (hex, rgb, oklch, etc).

- The goal is to keep all components aligned with the HeroUI Native design system.

- This ensures that in the future we can introduce a custom theme by only changing the theme layer, without modifying component implementations.
