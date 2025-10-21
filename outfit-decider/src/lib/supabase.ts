// Supabase client configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for storage paths
const PHOTO_EXTENSIONS = ['jpg', 'png'] as const;
type PhotoExtension = (typeof PHOTO_EXTENSIONS)[number];

export const getStoragePath = {
  clothingItem: (userId: string, itemId: string) => `${userId}/${itemId}.jpg`,
  userPhoto: (userId: string, extension: PhotoExtension = 'jpg') => `${userId}/photo.${extension}`,
  generatedPhoto: (userId: string, photoId: string, extension: PhotoExtension = 'jpg') =>
    `${userId}/${photoId}.${extension}`,
};

export const getAllUserPhotoPaths = (userId: string): string[] =>
  PHOTO_EXTENSIONS.map((ext) => getStoragePath.userPhoto(userId, ext));

// Helper to get public URL from storage
export const getPublicUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};
