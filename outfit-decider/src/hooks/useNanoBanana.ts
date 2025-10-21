// Custom hook for Nano Banana API operations
import { useState } from 'react';
import { generateVirtualTryOn, suggestOutfit } from '@/lib/nanoBanana';
import { supabase, getStoragePath, getPublicUrl, getAllUserPhotoPaths } from '@/lib/supabase';
import { STORAGE_BUCKETS } from '@/utils/constants';

export const useNanoBanana = (userId: string | undefined) => {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Generate virtual try-on and save to storage
   */
  const generateTryOn = async (
    userPhotoUrl: string,
    topImageUrl?: string,
    bottomImageUrl?: string
  ): Promise<{ url: string; persisted: boolean } | null> => {
    if (!userId) {
      setError('User not authenticated');
      return null;
    }

    setGenerating(true);
    setError(null);

    try {
      // Call Nano Banana API
      const result = await generateVirtualTryOn({
        userPhotoUrl,
        topImageUrl,
        bottomImageUrl,
      });

      const downloadGeneratedImage = async (): Promise<Blob> => {
        if (result.generatedImageUrl.startsWith('data:')) {
          const [metadata, base64] = result.generatedImageUrl.split(',');
          if (!metadata || !base64) {
            throw new Error('Invalid generated image data URL format');
          }
          const mimeMatch = metadata.match(/data:(.*);base64/);
          const mimeType = mimeMatch?.[1] || 'image/png';
          const byteCharacters = atob(base64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          return new Blob([byteArray], { type: mimeType });
        }

        const response = await fetch(result.generatedImageUrl, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to download generated image');
        }
        return await response.blob();
      };

      const blob = await downloadGeneratedImage();
      const extension = blob.type === 'image/png' ? 'png' : 'jpg';
      const fileName = `photo.${extension}`;
      const filePath = getStoragePath.userPhoto(userId, extension);

      await supabase.storage
        .from(STORAGE_BUCKETS.USER_PHOTOS)
        .remove(getAllUserPhotoPaths(userId));

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.USER_PHOTOS)
        .upload(
          filePath,
          new File([blob], fileName, { type: blob.type || `image/${extension}` }),
          {
            upsert: true,
            contentType: blob.type || `image/${extension}`,
            cacheControl: '0',
          }
        );

      if (uploadError) {
        throw uploadError;
      }

      const publicUrl = `${getPublicUrl(STORAGE_BUCKETS.USER_PHOTOS, filePath)}?t=${Date.now()}`;
      const { error: dbError } = await supabase
        .from('user_photos')
        .upsert(
          {
            user_id: userId,
            image_url: publicUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (dbError) {
        console.error('Failed to update user photo record:', dbError);
      }

      return { url: publicUrl, persisted: true };
    } catch (err: any) {
      console.error('Generate try-on error:', err);
      setError(err.message || 'Failed to generate try-on');
      return null;
    } finally {
      setGenerating(false);
    }
  };

  /**
   * Get AI outfit suggestions
   */
  const getSuggestion = async (
    prompt: string,
    availableTags: string[],
    availableItems: {
      tops: Array<{ id: string; tags: string[] }>;
      bottoms: Array<{ id: string; tags: string[] }>;
    }
  ): Promise<{ topId: string; bottomId: string; reasoning?: string } | null> => {
    setGenerating(true);
    setError(null);

    try {
      const result = await suggestOutfit(prompt, availableTags, availableItems);
      return {
        topId: result.topId,
        bottomId: result.bottomId,
        reasoning: result.reasoning,
      };
    } catch (err: any) {
      console.error('Get suggestion error:', err);
      setError(err.message || 'Failed to get suggestion');
      return null;
    } finally {
      setGenerating(false);
    }
  };

  return {
    generateTryOn,
    getSuggestion,
    generating,
    error,
  };
};
