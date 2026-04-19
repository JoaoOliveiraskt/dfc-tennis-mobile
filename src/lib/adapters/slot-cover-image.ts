import type { ImageSourcePropType } from "react-native";

export type SlotCoverImageActivityType =
  | "CLINIC"
  | "EVENT"
  | "GROUP"
  | "PRIVATE";
export type SlotCoverImageAudienceType = "ADULT" | "KIDS" | "OPEN";

const COVER_IMAGES_BY_BUCKET = {
  GROUP: [
    require("../../../assets/slot-feed-card-image/group-01.avif"),
    require("../../../assets/slot-feed-card-image/group-02.avif"),
    require("../../../assets/slot-feed-card-image/group-03.avif"),
    require("../../../assets/slot-feed-card-image/group-04.avif"),
    require("../../../assets/slot-feed-card-image/group-05.avif"),
    require("../../../assets/slot-feed-card-image/group-06.avif"),
    require("../../../assets/slot-feed-card-image/group-07.avif"),
    require("../../../assets/slot-feed-card-image/group-08.avif"),
    require("../../../assets/slot-feed-card-image/group-09.avif"),
    require("../../../assets/slot-feed-card-image/group-10.avif"),
    require("../../../assets/slot-feed-card-image/group-11.avif"),
    require("../../../assets/slot-feed-card-image/group-12.avif"),
    require("../../../assets/slot-feed-card-image/group-13.avif"),
    require("../../../assets/slot-feed-card-image/group-14.avif"),
  ],
  KIDS: [
    require("../../../assets/slot-feed-card-image/kids-01.avif"),
    require("../../../assets/slot-feed-card-image/kids-02.avif"),
    require("../../../assets/slot-feed-card-image/kids-03.avif"),
    require("../../../assets/slot-feed-card-image/kids-04.avif"),
    require("../../../assets/slot-feed-card-image/kids-05.avif"),
    require("../../../assets/slot-feed-card-image/kids-06.avif"),
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
} as const satisfies Record<string, readonly ImageSourcePropType[]>;

const DEFAULT_IMAGE_BY_BUCKET = {
  GROUP: COVER_IMAGES_BY_BUCKET.GROUP[0],
  KIDS: COVER_IMAGES_BY_BUCKET.KIDS[0],
  PRIVATE: COVER_IMAGES_BY_BUCKET.PRIVATE[0],
} as const;

const coverImageBySlotId = new Map<string, ImageSourcePropType>();
const lastIndexByBucket: Partial<
  Record<keyof typeof COVER_IMAGES_BY_BUCKET, number>
> = {};

function normalizeText(value?: string | null): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getCoverBucketByTitle(
  activityTitle?: string | null,
): keyof typeof COVER_IMAGES_BY_BUCKET | null {
  const normalizedTitle = normalizeText(activityTitle);

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

  if (
    normalizedTitle.includes("grupo") ||
    normalizedTitle.includes("group") ||
    normalizedTitle.includes("turma")
  ) {
    return "GROUP";
  }

  return null;
}

function getCoverBucket(params: {
  activityTitle?: string | null;
  activityType?: SlotCoverImageActivityType | null;
  audienceType?: SlotCoverImageAudienceType | null;
}): keyof typeof COVER_IMAGES_BY_BUCKET {
  const bucketByTitle = getCoverBucketByTitle(params.activityTitle);
  if (bucketByTitle) {
    return bucketByTitle;
  }

  if (params.activityType === "PRIVATE") {
    return "PRIVATE";
  }

  if (params.audienceType === "KIDS") {
    return "KIDS";
  }

  return "GROUP";
}

function resolveSlotCoverImage(params: {
  activityTitle?: string | null;
  activityType?: SlotCoverImageActivityType | null;
  audienceType?: SlotCoverImageAudienceType | null;
  excludeImages?: readonly ImageSourcePropType[];
  fallbackIndex?: number;
  skipCache?: boolean;
  slotId: string;
  startTime: string;
}): ImageSourcePropType {
  const bucket = getCoverBucket({
    activityTitle: params.activityTitle,
    activityType: params.activityType,
    audienceType: params.audienceType,
  });

  const cacheKey = `${bucket}:${params.slotId}`;
  const cachedImage = params.skipCache ? null : coverImageBySlotId.get(cacheKey);
  if (cachedImage && !params.skipCache) {
    return cachedImage;
  }

  const images = COVER_IMAGES_BY_BUCKET[bucket];
  const excludeImages = new Set(params.excludeImages ?? []);
  const candidateIndexes = images
    .map((image, index) => ({ image, index }))
    .filter(({ image }) => !excludeImages.has(image))
    .map(({ index }) => index);
  const effectiveIndexes =
    candidateIndexes.length > 0
      ? candidateIndexes
      : images.map((_, index) => index);
  const lastIndex = lastIndexByBucket[bucket];
  const fallbackOffset =
    effectiveIndexes.length > 0
      ? (params.fallbackIndex ?? 0) % effectiveIndexes.length
      : 0;
  let selectedIndex = effectiveIndexes[fallbackOffset] ?? 0;

  if (effectiveIndexes.length > 1) {
    const randomIndex = Math.floor(Math.random() * effectiveIndexes.length);
    selectedIndex = effectiveIndexes[randomIndex] ?? selectedIndex;

    if (lastIndex !== undefined && selectedIndex === lastIndex) {
      const currentEffectiveIndex = effectiveIndexes.indexOf(selectedIndex);
      const nextEffectiveIndex =
        currentEffectiveIndex >= 0
          ? (currentEffectiveIndex + 1) % effectiveIndexes.length
          : 0;
      selectedIndex = effectiveIndexes[nextEffectiveIndex] ?? selectedIndex;
    }
  }

  lastIndexByBucket[bucket] = selectedIndex;
  const selectedImage =
    images[selectedIndex] ??
    DEFAULT_IMAGE_BY_BUCKET[bucket] ??
    DEFAULT_IMAGE_BY_BUCKET.GROUP;
  coverImageBySlotId.set(cacheKey, selectedImage);

  return selectedImage;
}

function getSlotCoverImagePoolSize(params: {
  activityTitle?: string | null;
  activityType?: SlotCoverImageActivityType | null;
  audienceType?: SlotCoverImageAudienceType | null;
}): number {
  const bucket = getCoverBucket({
    activityTitle: params.activityTitle,
    activityType: params.activityType,
    audienceType: params.audienceType,
  });

  return COVER_IMAGES_BY_BUCKET[bucket].length;
}

export { getSlotCoverImagePoolSize, resolveSlotCoverImage };
