// Nano Banana API integration helpers
import { NANO_BANANA_PROMPTS } from '@/utils/constants';

const NANO_BANANA_API_KEY = import.meta.env.VITE_NANO_BANANA_API_KEY;
const NANO_BANANA_BASE_URL = import.meta.env.VITE_NANO_BANANA_BASE_URL;

if (!NANO_BANANA_BASE_URL) {
  console.warn('Nano Banana API base URL not configured');
}

interface GenerateTryOnParams {
  userPhotoUrl: string;
  topImageUrl?: string;
  bottomImageUrl?: string;
}

export interface GenerateTryOnResponse {
  generatedImageUrl: string;
  processingTime?: number;
}

const buildTryOnPrompt = (topImageUrl?: string, bottomImageUrl?: string) => {
  if (topImageUrl && bottomImageUrl) {
    return 'Place these clothing items naturally on the person in the image, maintaining realistic fit, shadows, and proportions.';
  }
  if (topImageUrl || bottomImageUrl) {
    return 'Place this clothing item naturally on the person in the image, maintaining realistic fit, shadows, and proportions.';
  }
  return NANO_BANANA_PROMPTS.VIRTUAL_TRYON;
};

/**
 * Generate virtual try-on using the Nano Banana proxy API.
 */
export const generateVirtualTryOn = async ({
  userPhotoUrl,
  topImageUrl,
  bottomImageUrl,
}: GenerateTryOnParams): Promise<GenerateTryOnResponse> => {
  if (!NANO_BANANA_BASE_URL) {
    throw new Error('Nano Banana API base URL not configured');
  }

  const stripCacheParam = (value?: string) => {
    if (!value) return value;
    try {
      const parsed = new URL(value);
      if (parsed.searchParams.has('t')) {
        parsed.searchParams.delete('t');
        return parsed.toString();
      }
      return value;
    } catch {
      return value;
    }
  };

  try {
    const sanitizedUserPhoto = stripCacheParam(userPhotoUrl);
    const sanitizedTop = stripCacheParam(topImageUrl);
    const sanitizedBottom = stripCacheParam(bottomImageUrl);

    const response = await fetch(`${NANO_BANANA_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(NANO_BANANA_API_KEY ? { Authorization: `Bearer ${NANO_BANANA_API_KEY}` } : {}),
      },
      body: JSON.stringify({
        user_photo: sanitizedUserPhoto,
        top_image: sanitizedTop,
        bottom_image: sanitizedBottom,
        prompt: buildTryOnPrompt(sanitizedTop, sanitizedBottom),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    const generatedImageUrl = data.generated_image_url || data.image_url || data.url;

    if (!generatedImageUrl) {
      throw new Error('Nano Banana response did not include a generated image URL');
    }

    return {
      generatedImageUrl,
      processingTime: data.processing_time,
    };
  } catch (error) {
    console.error('Nano Banana generate error:', error);
    throw error;
  }
};

/**
 * Get outfit suggestions based on vibe/prompt.
 */
export const suggestOutfit = async (
  userPrompt: string,
  availableTags: string[],
  availableItems: {
    tops: Array<{ id: string; tags: string[] }>;
    bottoms: Array<{ id: string; tags: string[] }>;
  }
): Promise<{ topId: string; bottomId: string; reasoning?: string }> => {
  if (!NANO_BANANA_BASE_URL) {
    throw new Error('Nano Banana API base URL not configured');
  }

  try {
    const response = await fetch(`${NANO_BANANA_BASE_URL}/suggest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(NANO_BANANA_API_KEY ? { Authorization: `Bearer ${NANO_BANANA_API_KEY}` } : {}),
      },
      body: JSON.stringify({
        prompt: NANO_BANANA_PROMPTS.SUGGEST_OUTFIT(userPrompt),
        available_tags: availableTags,
        available_items: availableItems,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || `API request failed: ${response.status}`);
    }

    const data = await response.json();
    const topId = data.topId ?? data.suggested_top_id;
    const bottomId = data.bottomId ?? data.suggested_bottom_id;

    if (!topId || !bottomId) {
      throw new Error('Suggestion missing required clothing IDs');
    }

    return {
      topId,
      bottomId,
      reasoning: data.reasoning,
    };
  } catch (error) {
    console.error('Nano Banana suggest error:', error);
    throw error;
  }
};
