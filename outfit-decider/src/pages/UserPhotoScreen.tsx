// User photo upload screen
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SemiCircleNav from '@/components/shared/SemiCircleNav';
import RatingModal from '@/components/shared/RatingModal';
import FileMenu from '@/components/wardrobe/FileMenu';
import { supabase, getStoragePath, getPublicUrl, getAllUserPhotoPaths } from '@/lib/supabase';
import { validateImageFile, compressImage } from '@/lib/imageUtils';
import { STORAGE_BUCKETS } from '@/utils/constants';
import './UserPhotoScreen.css';

const UserPhotoScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hasGeneratedTryOn, setHasGeneratedTryOn] = useState(false);
  const [hasOriginalBackup, setHasOriginalBackup] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const refreshGenerationState = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const generatedUrl = sessionStorage.getItem('lastGeneratedImageUrl');
    const generatedOutfit = sessionStorage.getItem('lastGeneratedOutfit');
    const backupData = sessionStorage.getItem('originalUserPhotoData');

    setHasGeneratedTryOn(Boolean(generatedUrl && generatedOutfit));
    setHasOriginalBackup(Boolean(backupData));
  }, []);

  useEffect(() => {
    loadUserPhoto();
    refreshGenerationState();
  }, [user, refreshGenerationState]);

  const loadUserPhoto = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_photos')
      .select('image_url')
      .eq('user_id', user.id)
      .single();

    if (data?.image_url) {
      setPhotoUrl(data.image_url);
      setPreviewUrl(data.image_url);
    } else if (typeof window !== 'undefined') {
      sessionStorage.removeItem('lastGeneratedImageUrl');
      sessionStorage.removeItem('lastGeneratedOutfit');
      sessionStorage.removeItem('originalUserPhotoData');
      sessionStorage.removeItem('originalUserPhotoSource');
    }

    refreshGenerationState();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setError('');
    setShowDeleteButton(false); // Hide delete button during upload

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    try {
      setUploading(true);

      // Compress image
      const compressedFile = await compressImage(file);

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('lastGeneratedImageUrl');
        sessionStorage.removeItem('lastGeneratedOutfit');
        sessionStorage.removeItem('originalUserPhotoData');
        sessionStorage.removeItem('originalUserPhotoSource');
      }

      const extension = compressedFile.type === 'image/png' ? 'png' : 'jpg';
      const filePath = getStoragePath.userPhoto(user.id, extension);

      await supabase.storage
        .from(STORAGE_BUCKETS.USER_PHOTOS)
        .remove(getAllUserPhotoPaths(user.id));

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.USER_PHOTOS)
        .upload(filePath, compressedFile, {
          upsert: true,
          contentType: compressedFile.type,
          cacheControl: '0', // Prevent caching old image
        });

      if (uploadError) throw uploadError;

      // Get public URL with cache busting
      const timestamp = new Date().getTime();
      const publicUrl = `${getPublicUrl(STORAGE_BUCKETS.USER_PHOTOS, filePath)}?t=${timestamp}`;

      // Save to database
      const { error: dbError } = await supabase
        .from('user_photos')
        .upsert(
          {
            user_id: user.id,
            image_url: publicUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (dbError) throw dbError;

      setPhotoUrl(publicUrl);
      setPreviewUrl(publicUrl);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload photo');
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      refreshGenerationState();
    }
  };

  const handlePhotoClick = () => {
    if (!photoUrl) {
      // No photo yet, trigger upload
      fileInputRef.current?.click();
      return;
    }

    // Double-click detection
    setClickCount((prev) => prev + 1);

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    // Show delete button on second click
    if (clickCount === 1) {
      setShowDeleteButton(true);
      setClickCount(0);
      // Don't auto-hide, let user manually close or delete
      return;
    }

    // Reset after 500ms if only single click
    clickTimeoutRef.current = setTimeout(() => {
      setClickCount(0);
    }, 500);
  };

  const handleDelete = async () => {
    if (!user || !photoUrl) return;

    try {
      setUploading(true);

      // Delete from storage
      const pathsToRemove = getAllUserPhotoPaths(user.id);
      await supabase.storage
        .from(STORAGE_BUCKETS.USER_PHOTOS)
        .remove(pathsToRemove);

      // Delete from database
      await supabase
        .from('user_photos')
        .delete()
        .eq('user_id', user.id);

      setPhotoUrl(null);
      setPreviewUrl(null);
      setShowDeleteButton(false);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('lastGeneratedImageUrl');
        sessionStorage.removeItem('lastGeneratedOutfit');
        sessionStorage.removeItem('originalUserPhotoData');
        sessionStorage.removeItem('originalUserPhotoSource');
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete photo');
    } finally {
      setUploading(false);
      refreshGenerationState();
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveRatingClick = () => {
    if (!hasGeneratedTryOn) {
      return;
    }
    setShowRatingModal(true);
  };

  const handleSaveOutfit = async (rating: number | null) => {
    if (!user) return;

    if (typeof window === 'undefined') {
      setError('Unable to save rating in this environment.');
      return;
    }

    const generatedUrl = sessionStorage.getItem('lastGeneratedImageUrl');
    const outfitMetadata = sessionStorage.getItem('lastGeneratedOutfit');

    if (!generatedUrl || !outfitMetadata) {
      setError('No generated outfit available to save.');
      setShowRatingModal(false);
      return;
    }

    try {
      const parsed = JSON.parse(outfitMetadata || '{}') || {};
      const topId = parsed.topId || null;
      const bottomId = parsed.bottomId || null;

      const downloadGeneratedImage = async (
        imageUrl: string
      ): Promise<{ blob: Blob; extension: 'jpg' | 'png'; mimeType: string }> => {
        const inferExtension = (mimeType?: string | null): 'jpg' | 'png' =>
          mimeType && mimeType.toLowerCase().includes('png') ? 'png' : 'jpg';

        if (imageUrl.startsWith('data:')) {
          const match = imageUrl.match(/^data:(.+);base64,(.*)$/);
          if (!match) {
            throw new Error('Stored generated image is not a valid data URL');
          }
          const mimeType = match[1];
          const base64Data = match[2];
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: mimeType || 'image/png' });
          const extension = inferExtension(mimeType);
          return {
            blob,
            extension,
            mimeType: mimeType || `image/${extension}`,
          };
        }

        const response = await fetch(imageUrl, { cache: 'no-store' });
        if (!response.ok) {
          throw new Error('Failed to download generated outfit image');
        }
        const blob = await response.blob();
        const mimeType = blob.type || response.headers.get('content-type') || 'image/jpeg';
        const extension = inferExtension(mimeType);
        return { blob, extension, mimeType };
      };

      const blobToDataUrl = (blob: Blob): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to convert generated image to data URL'));
          reader.readAsDataURL(blob);
        });

      const { data: outfitData, error: outfitError } = await supabase
        .from('saved_outfits')
        .insert({
          user_id: user.id,
          top_id: topId,
          bottom_id: bottomId,
          rating,
        })
        .select()
        .single();

      if (outfitError) throw outfitError;

      if (outfitData) {
        const { blob, extension, mimeType } = await downloadGeneratedImage(generatedUrl);
        const dataUrl = await blobToDataUrl(blob);
        let storedImageUrl = dataUrl;
        try {
          const photoId =
            typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
              ? crypto.randomUUID()
              : `${Date.now()}`;
          const storagePath = getStoragePath.generatedPhoto(user.id, photoId, extension);
          const storageFile = new File([blob], `generated.${extension}`, { type: mimeType });
          const { error: storageError } = await supabase.storage
            .from(STORAGE_BUCKETS.GENERATED_PHOTOS)
            .upload(storagePath, storageFile, {
              upsert: true,
              cacheControl: '0',
              contentType: mimeType,
            });

          if (storageError) {
            throw storageError;
          }

          // Storage copy is kept for persistence, but we continue to store the data URL
          // in the database so it renders regardless of bucket ACL settings.
        } catch (storageProblem) {
          console.error('Failed to persist generated outfit image to storage:', storageProblem);
        }

        const { error: generatedPhotoError } = await supabase
          .from('generated_photos')
          .insert({
            user_id: user.id,
            outfit_id: outfitData.id,
            image_url: storedImageUrl,
          });

        if (generatedPhotoError) {
          console.error('Failed to save generated photo record:', generatedPhotoError);
        }
      }

      setShowRatingModal(false);
      alert('Outfit saved successfully!');
    } catch (err: any) {
      console.error('Error saving outfit:', err);
      alert('Failed to save outfit');
    }
  };

  const handleResetGenerated = async () => {
    if (!user) return;

    if (typeof window === 'undefined') {
      setError('Unable to reset photo in this environment.');
      return;
    }

    const backupDataUrl = sessionStorage.getItem('originalUserPhotoData');

    if (!backupDataUrl) {
      setError('No original photo available to restore.');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const [metadata, base64] = backupDataUrl.split(',');
      if (!metadata || !base64) {
        throw new Error('Stored photo backup is invalid.');
      }

      const mimeMatch = metadata.match(/data:(.*);base64/);
      const mimeType = mimeMatch?.[1] || 'image/jpeg';
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      const extension = mimeType === 'image/png' ? 'png' : 'jpg';
      const filePath = getStoragePath.userPhoto(user.id, extension);

      await supabase.storage
        .from(STORAGE_BUCKETS.USER_PHOTOS)
        .remove(getAllUserPhotoPaths(user.id));

      const fileName = `photo.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.USER_PHOTOS)
        .upload(
          filePath,
          new File([blob], fileName, { type: mimeType }),
          {
            upsert: true,
            contentType: mimeType,
            cacheControl: '0',
          }
        );

      if (uploadError) throw uploadError;

      const restoredUrl = `${getPublicUrl(STORAGE_BUCKETS.USER_PHOTOS, filePath)}?t=${Date.now()}`;

      const { error: dbError } = await supabase
        .from('user_photos')
        .upsert(
          {
            user_id: user.id,
            image_url: restoredUrl,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (dbError) throw dbError;

      setPhotoUrl(restoredUrl);
      setPreviewUrl(restoredUrl);
      setShowDeleteButton(false);

      sessionStorage.removeItem('lastGeneratedImageUrl');
      sessionStorage.removeItem('lastGeneratedOutfit');
      sessionStorage.removeItem('originalUserPhotoData');
      sessionStorage.removeItem('originalUserPhotoSource');
      refreshGenerationState();
    } catch (err: any) {
      console.error('Reset error:', err);
      setError(err.message || 'Failed to reset photo');
    } finally {
      setUploading(false);
      refreshGenerationState();
    }
  };

  return (
    <div className="user-photo-screen">
      {/* Semi-circle navigation - left edge */}
      <SemiCircleNav
        direction="left"
        onClick={() => navigate('/')}
        className="semi-circle-left"
      />

      {/* File menu - top left */}
      <FileMenu className="file-menu" />

      <div className="user-photo-content">
        <h1 className="screen-title">Your Photo</h1>
        
        <div className="photo-container">
          <div className="window photo-window">
            <div className="title-bar">
              <div className="title-bar-text">Photo Preview</div>
            </div>
            <div className="window-body photo-window-body">
              {previewUrl ? (
                <div 
                  className="photo-preview"
                  onClick={handlePhotoClick}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={previewUrl} alt="User photo" className="user-photo" />
                  
                  {showDeleteButton && (
                    <>
                      {/* Overlay to close delete button */}
                      <div 
                        className="delete-overlay"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteButton(false);
                        }}
                      />
                      <button
                        className="delete-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete();
                        }}
                        aria-label="Delete photo"
                        type="button"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="photo-placeholder" onClick={handleUploadClick}>
                  <div className="placeholder-content">
                    <svg 
                      width="64" 
                      height="64" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      className="camera-icon"
                    >
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                    <p className="placeholder-text">
                      Add a photo of yourself standing straight
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="instruction-text">
            {photoUrl 
              ? 'Double-click photo to delete and upload a new one'
              : 'Click the camera icon to upload your photo'
            }
          </p>

          <div className="photo-actions">
            <div className="photo-action-slot">
              <button
                type="button"
                onClick={handleSaveRatingClick}
                disabled={!hasGeneratedTryOn || uploading}
                className="button photo-action-button save-rating-button"
                title={!hasGeneratedTryOn ? 'Generate an outfit before saving' : undefined}
              >
                Save / Rating
              </button>
            </div>

            <div className="photo-action-slot">
              <button
                type="button"
                onClick={handleResetGenerated}
                disabled={!hasGeneratedTryOn || !hasOriginalBackup || uploading}
                className="button photo-action-button reset-button"
                title={!hasGeneratedTryOn ? 'No generated outfit to reset' : undefined}
              >
                Reset Photo    
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {uploading && (
          <div className="uploading-overlay">
            <div className="loading-spinner" />
            <p>Uploading...</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          capture="environment"
        />

        {showRatingModal && (
          <RatingModal
            onSave={handleSaveOutfit}
            onCancel={() => setShowRatingModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default UserPhotoScreen;
