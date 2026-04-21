# Hero Surface Decision (Class Detail)

Date: 2026-04-20

## Goal

Elevate class-detail visual quality with image-driven hero treatment while preserving runtime performance on Expo/React Native.

## Chosen Stack

- `expo-image` for image rendering (hero + thumbs)
- `react-native-image-colors` for palette extraction
- `expo-linear-gradient` for image-driven scrim and bridge gradients
- Deterministic fallback tokens by class bucket (`group`, `kids`, `private`, `default`)
- In-memory token cache keyed by `class-detail:<id>`

## Why This Choice

- `react-native-image-colors` has stronger maturity than smaller alternatives and explicit Expo support.
- `expo-image` provides stable rendering and stronger format support in Expo runtime.
- Dynamic tokens let cards/background/bottom CTA inherit a calm color family from the hero image.
- Fallback tokens ensure no visual break when extraction fails.
- The selector favors bottom/background mass over high-saturation subject colors.

## Trade-offs

- Requires native build flow (`expo prebuild` / dev client) for extraction library.
- Palette values can differ slightly by platform implementation.
- AVIF extraction can fail on edge cases; fallback tokens remain the safety net.

## Runtime Safety

- Initial paint uses deterministic fallback tokens (no blocking).
- Runtime palette extraction is now the primary source:
  - call `getColors` with `cache: true`,
  - pass a stable `key` based on the image/palette seed,
  - choose Android `muted`, then `darkMuted`, then `dominant`,
  - choose iOS `background`, then `secondary`, then `detail`.
- Fallback tokens are used only when extraction fails.
- Tokens are cached to avoid repeated work and visual flicker on revisit.

## Variant Decision

- Android tested candidates: `dominant`, `muted`, `darkMuted`.
- iOS tested candidates: `detail`, `background`, `secondary`.
- Android choice: `muted`, with `darkMuted` then `dominant` fallback.
- iOS choice: `background`, with `secondary` then `detail` fallback.

`dominant`/`detail` can follow a player, shirt, or racket and pull the whole bottom hero toward the foreground subject. `muted` and `background` better represent the visual mass behind the cards, giving the bottom area a more stable premium base while still matching the class image. The overlay remains bottom-only so extraction color supports readability without washing the full photo.
