import React from "react";
import {
  Avatar,
  type AvatarColor,
  type AvatarFallbackProps,
  type AvatarImageProps,
  type AvatarRootProps,
} from "heroui-native";

interface UserAvatarProps extends Omit<AvatarRootProps, "alt" | "children"> {
  readonly alt?: string;
  readonly email?: string | null;
  readonly fallbackClassName?: string;
  readonly fallbackDelayMs?: number;
  readonly fallbackLabel?: string;
  readonly image?: string | null;
  readonly imageClassName?: string;
  readonly name?: string | null;
  readonly userId?: string | null;
}

const FALLBACK_COLORS: readonly AvatarColor[] = [
  "accent",
  "success",
  "warning",
  "danger",
];

function hashSeed(value: string): string {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36);
}

function buildDicebearAvatarUrl(seed: string): string {
  const encodedSeed = encodeURIComponent(hashSeed(seed));
  return `https://api.dicebear.com/9.x/adventurer/svg?backgroundColor=c0aede&seed=${encodedSeed}`;
}

function normalizeAvatarImageUri(image?: string | null): string | null {
  const normalizedImage = image?.trim() ?? "";
  return normalizedImage || null;
}

function hashString(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function resolveAvatarSeed(params: {
  readonly email?: string | null;
  readonly name?: string | null;
  readonly userId?: string | null;
}): string {
  return (
    params.userId?.trim() ||
    params.email?.trim() ||
    params.name?.trim() ||
    "guest"
  );
}

function resolveAvatarInitials(params: {
  readonly email?: string | null;
  readonly fallbackLabel?: string;
  readonly name?: string | null;
}): string {
  const source =
    params.name?.trim() ||
    params.email?.trim() ||
    params.fallbackLabel?.trim() ||
    "DF";
  const words = source.split(/\s+/).filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
  }

  return (words[0]?.slice(0, 2) || "DF").toUpperCase();
}

function resolveAvatarColor(seed: string): AvatarColor {
  return FALLBACK_COLORS[hashString(seed) % FALLBACK_COLORS.length] ?? "accent";
}

function UserAvatar({
  alt,
  color,
  email,
  fallbackClassName,
  fallbackDelayMs = 120,
  fallbackLabel,
  image,
  imageClassName,
  name,
  userId,
  variant = "default",
  animation = "disable-all",
  ...props
}: UserAvatarProps): React.JSX.Element {
  const imageUri = normalizeAvatarImageUri(image);
  const seed = resolveAvatarSeed({ email, name, userId });
  const resolvedImageUri = imageUri ?? buildDicebearAvatarUrl(seed);

  return (
    <Avatar
      alt={alt ?? name ?? email ?? fallbackLabel ?? "Usuário"}
      animation={animation}
      color={color ?? resolveAvatarColor(seed)}
      variant={variant}
      {...props}
    >
      <Avatar.Image
        source={{ uri: resolvedImageUri }}
        animation={false}
        className={imageClassName}
      />
      <Avatar.Fallback
        animation="disabled"
        className={fallbackClassName}
        delayMs={fallbackDelayMs}
      >
        {resolveAvatarInitials({ email, fallbackLabel, name })}
      </Avatar.Fallback>
    </Avatar>
  );
}

export default Avatar;
export {
  buildDicebearAvatarUrl,
  UserAvatar,
  normalizeAvatarImageUri,
  resolveAvatarColor,
  resolveAvatarInitials,
  resolveAvatarSeed,
};
export type {
  AvatarColor,
  AvatarFallbackProps,
  AvatarImageProps,
  AvatarRootProps,
  UserAvatarProps,
};
