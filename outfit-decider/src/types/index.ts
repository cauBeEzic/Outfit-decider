// Core type definitions for Outfit Decider

export type ClothingType = 'top' | 'bottom';

export interface ClothingItem {
  id: string;
  user_id: string;
  type: ClothingType;
  image_url: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface SavedOutfit {
  id: string;
  user_id: string;
  top_id: string | null; // Nullable for partial outfits
  bottom_id: string | null; // Nullable for partial outfits
  rating: number | null; // 1-5 or null
  created_at: string;
  updated_at: string;
}

export interface GeneratedPhoto {
  id: string;
  user_id: string;
  outfit_id: string;
  image_url: string;
  prompt_used: string | null;
  created_at: string;
}

export interface UserPhoto {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  last_viewed_top_id: string | null;
  last_viewed_bottom_id: string | null;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  onboarding_completed?: boolean;
}

// UI State types
export interface OnboardingStep {
  step: number;
  title: string;
  description: string;
  targetElement: 'semi-circle' | 'file-menu' | 'generate-button' | 'save-button';
  position: 'top' | 'bottom' | 'left' | 'right';
}

export interface WardrobeState {
  currentTop: ClothingItem | null;
  currentBottom: ClothingItem | null;
  generatedImage: string | null;
  isGenerating: boolean;
}

// API Response types
export interface NanoBananaGenerateRequest {
  user_photo_url: string;
  top_image_url?: string;
  bottom_image_url?: string;
  prompt: string;
}

export interface NanoBananaGenerateResponse {
  generated_image_url: string;
  processing_time?: number;
}

export interface NanoBananaSuggestRequest {
  user_prompt: string;
  available_tags: string[];
  available_items: {
    tops: Array<{ id: string; tags: string[] }>;
    bottoms: Array<{ id: string; tags: string[] }>;
  };
}

export interface NanoBananaSuggestResponse {
  suggested_top_id: string;
  suggested_bottom_id: string;
  reasoning?: string;
}