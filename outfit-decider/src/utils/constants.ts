// App-wide constants

export const STORAGE_BUCKETS = {
  CLOTHING_ITEMS: 'clothing-items',
  USER_PHOTOS: 'user-photos',
  GENERATED_PHOTOS: 'generated-photos',
} as const;

export const IMAGE_LIMITS = {
  MAX_SIZE_MB: 5,
  MAX_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png'],
  COMPRESSION_OPTIONS: {
    maxSizeMB: 2,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  },
} as const;

type OnboardingPosition = 'top' | 'bottom' | 'left' | 'right';

export interface OnboardingStepConfig {
  step: number;
  title: string;
  description: string;
  targetElement: string;
  position: OnboardingPosition;
}

export const ONBOARDING_STEPS = [
  {
    step: 1,
    title: 'Start by uploading your photo',
    description: 'Click here to add a full-body photo of yourself',
    targetElement: '.semi-circle-right',
    position: 'left' as OnboardingPosition,
  },
  {
    step: 2,
    title: 'Upload your first top',
    description: 'Add a top to your wardrobe (optional)',
    targetElement: '.file-menu',
    position: 'bottom' as OnboardingPosition,
  },
  {
    step: 3,
    title: 'Now upload a bottom',
    description: 'Add a bottom or skip to style just one piece',
    targetElement: '.file-menu',
    position: 'bottom' as OnboardingPosition,
  },
  {
    step: 4,
    title: 'Click Generate to see yourself in this outfit',
    description: 'AI will place the clothes on your photo',
    targetElement: '.generate-button',
    position: 'top' as OnboardingPosition,
  },
  {
    step: 5,
    title: 'Save your favorite outfits here',
    description: 'Rate and save combinations you love',
    targetElement: '.save-rating-button',
    position: 'top' as OnboardingPosition,
  },
] as const satisfies readonly OnboardingStepConfig[];

export const PLACEHOLDER_MESSAGES = {
  TOP: 'Upload your top',
  BOTTOM: 'Upload your bottom',
  USER_PHOTO: 'Add a photo of yourself standing straight',
  NO_ITEMS: 'No items yet. Upload your first piece!',
  NO_OUTFITS: 'No saved outfits yet. Generate and save your first outfit!',
  UPLOAD_PHOTO_FIRST: 'Upload a pic of yourself first',
  UPLOAD_BOTH_ITEMS: 'Upload top and bottom to get full outfit suggestions',
} as const;

export const NANO_BANANA_PROMPTS = {
  VIRTUAL_TRYON: 'Place this clothing naturally on the person in the image, maintaining realistic fit, shadows, and proportions',
  SUGGEST_OUTFIT: (vibe: string) => `Based on the vibe "${vibe}", suggest clothing items that match`,
} as const;
