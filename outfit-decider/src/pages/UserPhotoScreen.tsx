// User photo upload screen
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import SemiCircleNav from '@/components/shared/SemiCircleNav';
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
  const [clickCount, setClickCount] = useState(0);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadUserPhoto();
  }, [user]);

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
    }
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
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete photo');
    } finally {
      setUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="user-photo-screen">
      {/* Semi-circle navigation - left edge */}
      <SemiCircleNav
        direction="left"
        onClick={() => navigate('/')}
        className="semi-circle-left"
      />

      <div className="user-photo-content">
        <h1 className="screen-title">Your Photo</h1>
        
        <div className="photo-container">
          <wired-card elevation="3" className="photo-card">
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
          </wired-card>

          <p className="instruction-text">
            {photoUrl 
              ? 'Double-click photo to delete and upload a new one'
              : 'Click the camera icon to upload your photo'
            }
          </p>
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
      </div>
    </div>
  );
};

export default UserPhotoScreen;
