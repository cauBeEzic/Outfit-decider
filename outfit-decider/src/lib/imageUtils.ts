// Image validation and compression utilities
import imageCompression from 'browser-image-compression';
import { IMAGE_LIMITS } from '@/utils/constants';

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = IMAGE_LIMITS.ALLOWED_TYPES as readonly string[];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Only JPEG and PNG images are allowed',
    };
  }

  // Check file size
  if (file.size > IMAGE_LIMITS.MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: `Image must be less than ${IMAGE_LIMITS.MAX_SIZE_MB}MB`,
    };
  }

  return { valid: true };
};

export const compressImage = async (file: File): Promise<File> => {
  try {
    const compressedFile = await imageCompression(file, IMAGE_LIMITS.COMPRESSION_OPTIONS);
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    throw new Error('Failed to compress image');
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
