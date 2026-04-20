import type { ImageSourcePropType } from "react-native";

export type SlotCoverImageActivityType =
  | "CLINIC"
  | "EVENT"
  | "GROUP"
  | "PRIVATE";
export type SlotCoverImageAudienceType = "ADULT" | "KIDS" | "OPEN";
export type SlotCoverImageBucket = "GROUP" | "KIDS" | "PRIVATE";

const COVER_IMAGES_BY_BUCKET = {
  GROUP: [
    require("../../../assets/slot-feed-card-image/group-02.avif"),
    require("../../../assets/slot-feed-card-image/group-03.avif"),
    require("../../../assets/slot-feed-card-image/group-04.avif"),
    require("../../../assets/slot-feed-card-image/group-05.avif"),
    require("../../../assets/slot-feed-card-image/group-06.avif"),
    require("../../../assets/slot-feed-card-image/group-07.avif"),
    require("../../../assets/slot-feed-card-image/group-09.avif"),
    require("../../../assets/slot-feed-card-image/group-10.avif"),
    require("../../../assets/slot-feed-card-image/group-12.avif"),
    require("../../../assets/slot-feed-card-image/group-13.avif"),
  ],
  KIDS: [
    require("../../../assets/slot-feed-card-image/kids-01.avif"),
    require("../../../assets/slot-feed-card-image/kids-03.avif"),
    require("../../../assets/slot-feed-card-image/kids-04.avif"),
    require("../../../assets/slot-feed-card-image/kids-05.avif"),
    require("../../../assets/slot-feed-card-image/kids-07.avif"),
    require("../../../assets/slot-feed-card-image/kids-08.avif"),
    require("../../../assets/slot-feed-card-image/kids-09.avif"),
    require("../../../assets/slot-feed-card-image/kids-10.avif"),
    require("../../../assets/slot-feed-card-image/kids-11.avif"),
    require("../../../assets/slot-feed-card-image/kids-12.avif"),
    require("../../../assets/slot-feed-card-image/kids-13.avif"),
  ],
  PRIVATE: [
    require("../../../assets/slot-feed-card-image/private-01.avif"),
    require("../../../assets/slot-feed-card-image/private-02.avif"),
    require("../../../assets/slot-feed-card-image/private-03.avif"),
    require("../../../assets/slot-feed-card-image/private-04.avif"),
    require("../../../assets/slot-feed-card-image/private-05.avif"),
    require("../../../assets/slot-feed-card-image/private-06.avif"),
    require("../../../assets/slot-feed-card-image/private-07.avif"),
    require("../../../assets/slot-feed-card-image/private-08.avif"),
    require("../../../assets/slot-feed-card-image/private-09.avif"),
    require("../../../assets/slot-feed-card-image/private-10.avif"),
    require("../../../assets/slot-feed-card-image/private-11.avif"),
    require("../../../assets/slot-feed-card-image/private-12.avif"),
    require("../../../assets/slot-feed-card-image/private-13.avif"),
  ],
} as const satisfies Record<SlotCoverImageBucket, readonly ImageSourcePropType[]>;

const DEFAULT_SLOT_COVER_IMAGE = COVER_IMAGES_BY_BUCKET.GROUP[0];
const coverImageBySeed = new Map<string, ImageSourcePropType>();

function normalizeText(value?: string | null): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function resolveSlotCoverBucket(params: {
  activityTitle?: string | null;
  activityType?: SlotCoverImageActivityType | null;
  audienceType?: SlotCoverImageAudienceType | null;
}): SlotCoverImageBucket {
  if (params.activityType === "PRIVATE") {
    return "PRIVATE";
  }

  if (params.audienceType === "KIDS") {
    return "KIDS";
  }

  const normalizedTitle = normalizeText(params.activityTitle);
  if (
    normalizedTitle.includes("particular") ||
    normalizedTitle.includes("private") ||
    normalizedTitle.includes("individual")
  ) {
    return "PRIVATE";
  }

  if (
    normalizedTitle.includes("kids") ||
    normalizedTitle.includes("infantil") ||
    normalizedTitle.includes("crianca") ||
    normalizedTitle.includes("criança")
  ) {
    return "KIDS";
  }

  return "GROUP";
}

function ensureLocalSlotCoverImage(
  image: ImageSourcePropType | null | undefined,
): ImageSourcePropType {
  return typeof image === "number" ? image : DEFAULT_SLOT_COVER_IMAGE;
}

function hashString(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function resolveSlotCoverSeed(params: {
  activityTitle?: string | null;
  activityType?: SlotCoverImageActivityType | null;
  audienceType?: SlotCoverImageAudienceType | null;
  slotId?: string | null;
  startTime?: string | null;
}): string {
  return [
    params.slotId?.trim(),
    params.startTime?.trim(),
    params.activityType,
    params.audienceType,
    normalizeText(params.activityTitle),
  ]
    .filter((part): part is string => Boolean(part))
    .join("|");
}

function resolveSlotCoverImageKey(params: {
  activityTitle?: string | null;
  activityType?: SlotCoverImageActivityType | null;
  audienceType?: SlotCoverImageAudienceType | null;
  slotId?: string | null;
  startTime?: string | null;
}): string {
  const bucket = resolveSlotCoverBucket(params);
  const seed = resolveSlotCoverSeed(params) || bucket;
  const images = COVER_IMAGES_BY_BUCKET[bucket];
  const imageIndex = images.length > 0 ? hashString(seed) % images.length : 0;

  return `${bucket}:${imageIndex}:${hashString(seed)}`;
}

function resolveSlotCoverImage(params: {
  activityTitle?: string | null;
  activityType?: SlotCoverImageActivityType | null;
  audienceType?: SlotCoverImageAudienceType | null;
  slotId?: string | null;
  startTime?: string | null;
}): ImageSourcePropType {
  const bucket = resolveSlotCoverBucket(params);
  const seed = resolveSlotCoverSeed(params) || bucket;
  const cacheKey = `${bucket}:${seed}`;
  const cachedImage = coverImageBySeed.get(cacheKey);
  if (cachedImage) {
    return cachedImage;
  }

  const images = COVER_IMAGES_BY_BUCKET[bucket];
  const imageIndex = images.length > 0 ? hashString(seed) % images.length : 0;
  const image = images[imageIndex] ?? DEFAULT_SLOT_COVER_IMAGE;
  coverImageBySeed.set(cacheKey, image);

  return image;
}

function getSlotCoverImagePoolSize(): number {
  return Math.max(
    COVER_IMAGES_BY_BUCKET.GROUP.length,
    COVER_IMAGES_BY_BUCKET.KIDS.length,
    COVER_IMAGES_BY_BUCKET.PRIVATE.length,
  );
}

function resolveDefaultSlotCoverImage(params: {
  activityTitle?: string | null;
  activityType?: SlotCoverImageActivityType | null;
  audienceType?: SlotCoverImageAudienceType | null;
}): ImageSourcePropType {
  return resolveSlotCoverImage(params);
}

export {
  DEFAULT_SLOT_COVER_IMAGE,
  ensureLocalSlotCoverImage,
  getSlotCoverImagePoolSize,
  resolveDefaultSlotCoverImage,
  resolveSlotCoverBucket,
  resolveSlotCoverImage,
  resolveSlotCoverImageKey,
};
