// Supabase client configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper functions for storage paths
export const getStoragePath = {
  clothingItem: (userId: string, itemId: string) => `${userId}/${itemId}.jpg`,
  userPhoto: (userId: string) => `${userId}/photo.jpg`,
  generatedPhoto: (userId: string, photoId: string) => `${userId}/${photoId}.jpg`,
};

// Helper to get public URL from storage
export const getPublicUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};