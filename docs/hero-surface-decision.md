# Hero Surface Decision (Class Detail)

Date: 2026-04-19

## Goal

Elevate class-detail visual quality with image-driven hero treatment while preserving runtime performance on Expo/React Native.

## Chosen Stack

- `expo-image` for image rendering (hero + thumbs)
- `react-native-image-colors` for palette extraction
- `expo-image-manipulator` to crop the lower band before extraction
- `expo-linear-gradient` for image-driven scrim and bridge gradients
- Deterministic fallback tokens by class bucket (`group`, `kids`, `private`, `default`)
- In-memory token cache keyed by `class-detail:<id>`

## Why This Choice

- `react-native-image-colors` has stronger maturity than smaller alternatives and explicit Expo support.
- `expo-image` provides stable rendering and stronger format support in Expo runtime.
- Dynamic tokens let cards/background/bottom CTA inherit color family from hero image.
- Fallback tokens ensure no visual break when extraction fails.

## Trade-offs

- Requires native build flow (`expo prebuild` / dev client) for extraction library.
- Palette values can differ slightly by platform implementation.
- AVIF extraction can fail on edge cases; fallback tokens remain the safety net.

## Runtime Safety

- Initial paint uses deterministic fallback tokens (no blocking).
- Runtime palette extraction is now the primary source:
  - crop lower hero band,
  - call `getColors`,
  - prioritize `dominant` as base family.
- Fallback tokens are used only when extraction fails.
- Tokens are cached to avoid repeated work and visual flicker on revisit.
