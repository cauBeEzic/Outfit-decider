// Core type definitions for Outfit Decider

export interface User {
  id: string;
  email: string;
  onboarding_completed: boolean;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  last_viewed_top_id: string | null;
  last_viewed_bottom_id: string | null;
  updated_at: string;
}

export interface UserPhoto {
  id: string;
  user_id: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

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
  top_id: string | null;
  bottom_id: string | null;
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

// Extended types with populated data
export interface SavedOutfitWithItems extends SavedOutfit {
  top?: ClothingItem;
  bottom?: ClothingItem;
  generated_photos: GeneratedPhoto[];
}

// Extended types with populated data
export interface SavedOutfitWithItems extends SavedOutfit {
  top?: ClothingItem;
  bottom?: ClothingItem;
  generated_photos: GeneratedPhoto[];
}

// API response types
export interface NanoBananaGenerateRequest {
  user_photo_url: string;
  top_image_url?: string;
  bottom_image_url?: string;
  prompt: string;
}

export interface NanoBananaGenerateResponse {
  generated_image_url: string;
  processing_time: number;
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

// UI State types
export interface WardrobeState {
  currentTopIndex: number;
  currentBottomIndex: number;
  tops: ClothingItem[];
  bottoms: ClothingItem[];
  generatedImageUrl: string | null;
  isGenerating: boolean;
}

export interface OnboardingStep {
  step: number;
  title: string;
  description: string;
  targetElement: string; // CSS selector
  position: 'top' | 'bottom' | 'left' | 'right';
}