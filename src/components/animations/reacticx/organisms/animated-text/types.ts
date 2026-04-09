import type { StyleProp, TextStyle } from "react-native";

type AnimationDirection = "ltr" | "rtl";

interface CharacterAnimationParams {
  opacity: number;
  translateY: number;
  scale: number;
  rotate: number;
}

interface AnimationConfig {
  characterDelay: number;
  characterEnterDuration: number;
  characterExitDuration: number;
  layoutTransitionDuration: number;
  spring: {
    damping: number;
    stiffness: number;
    mass: number;
  };
  readonly maxBlurIntensity?: number;
}

interface StaggeredTextProps {
  text: string;
  readonly direction?: AnimationDirection;
  readonly style?: StyleProp<TextStyle>;
  readonly animationConfig?: Partial<AnimationConfig>;
  readonly enterFrom?: Partial<CharacterAnimationParams>;
  readonly enterTo?: Partial<CharacterAnimationParams>;
  readonly exitFrom?: Partial<CharacterAnimationParams>;
  readonly exitTo?: Partial<CharacterAnimationParams>;
  readonly onRevealComplete?: () => void;
}

interface CharacterProps {
  char: string;
  delayIndex: number;
  isLastToReveal: boolean;
  animationConfig: AnimationConfig;
  enterFrom: CharacterAnimationParams;
  enterTo: CharacterAnimationParams;
  exitFrom: CharacterAnimationParams;
  exitTo: CharacterAnimationParams;
  readonly style?: StyleProp<TextStyle>;
  readonly onRevealComplete?: () => void;
}

export type {
  StaggeredTextProps,
  AnimationConfig,
  CharacterAnimationParams,
  CharacterProps,
  AnimationDirection,
};
