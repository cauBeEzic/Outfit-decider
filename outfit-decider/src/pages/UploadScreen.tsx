// Upload clothing items screen
import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import WiredButton from '@/components/shared/WiredButton';
import TagInput from '@/components/upload/TagInput';
import { supabase, getStoragePath, getPublicUrl } from '@/lib/supabase';
import { validateImageFile, compressImage } from '@/lib/imageUtils';
import { STORAGE_BUCKETS } from '@/utils/constants';
import { ClothingType } from '@/types';
import './UploadScreen.css';

const UploadScreen: React.FC = () => {
  const { type } = useParams<{ type: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  const clothingType = type as ClothingType;
  const isValidType = clothingType === 'top' || clothingType === 'bottom';

  if (!isValidType) {
    return (
      <div className="upload-screen">
        <div className="error-container">
          <h1>Invalid clothing type</h1>
          <WiredButton onClick={() => navigate('/')}>
            Back to Wardrobe
          </WiredButton>
        </div>
      </div>
    );
  }

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    setSelectedFile(file);
  };

  const handleRetake = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setTags([]);
    setShowTagInput(false);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!selectedFile || !user) return;

    setError('');
    setUploading(true);

    try {
      // Compress image
      const compressedFile = await compressImage(selectedFile);

      // Generate unique ID for this item
      const itemId = crypto.randomUUID();
      const filePath = getStoragePath.clothingItem(user.id, itemId);

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKETS.CLOTHING_ITEMS)
        .upload(filePath, compressedFile, {
          contentType: compressedFile.type,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const publicUrl = getPublicUrl(STORAGE_BUCKETS.CLOTHING_ITEMS, filePath);

      // Save to database
      const { error: dbError } = await supabase
        .from('clothing_items')
        .insert({
          id: itemId,
          user_id: user.id,
          type: clothingType,
          image_url: publicUrl,
          tags: tags,
        });

      if (dbError) throw dbError;

      // Reset for next upload
      handleRetake();
      
      // Show success message briefly
      alert(`${clothingType === 'top' ? 'Top' : 'Bottom'} saved successfully!`);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload item');
    } finally {
      setUploading(false);
    }
  };

  const handleAddTags = (newTags: string[]) => {
    setTags(newTags);
    setShowTagInput(false);
  };

  return (
    <div className="upload-screen">
      <div className="upload-content">
        <div className="upload-header">
          <h1 className="screen-title">
            Upload {clothingType === 'top' ? 'Top' : 'Bottom'}
          </h1>
          <WiredButton onClick={() => navigate('/')}>
            Back
          </WiredButton>
        </div>

        <div className="upload-container">
          <div className="upload-frame">
            <wired-card elevation="3" className="upload-card">
              <div className="upload-card-content">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="preview-image" />
                ) : (
                  <div className="camera-placeholder" onClick={handleCameraClick}>
                    <svg 
                      width="80" 
                      height="80" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      className="camera-icon"
                    >
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                      <circle cx="12" cy="13" r="4"></circle>
                    </svg>
                  </div>
                )}
              </div>
            </wired-card>
          </div>

          {/* Tag section - always rendered to maintain consistent spacing */}
          <div className="tag-section">
            {previewUrl ? (
              <>
                <button
                  className="tag-button"
                  onClick={() => setShowTagInput(true)}
                  aria-label="Add tags"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  <span className="tag-button-label">Tags</span>
                </button>

                {/* Display current tags */}
                {tags.length > 0 && (
                  <div className="tags-display">
                    {tags.map((tag, index) => (
                      <span key={index} className="tag-chip">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="tag-placeholder"></div>
            )}
          </div>
        </div>

        {/* Action buttons below frame */}
        {previewUrl && (
          <div className="upload-actions">
            <WiredButton
              onClick={handleRetake}
              disabled={uploading}
              className="action-button"
            >
              Retake
            </WiredButton>
            <WiredButton
              onClick={handleSave}
              disabled={uploading}
              className="action-button"
            >
              {uploading ? 'Saving...' : 'Save'}
            </WiredButton>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
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

      {/* Tag input modal */}
      {showTagInput && (
        <TagInput
          existingTags={tags}
          onSave={handleAddTags}
          onCancel={() => setShowTagInput(false)}
        />
      )}

      {uploading && (
        <div className="uploading-overlay">
          <div className="loading-spinner" />
          <p>Uploading...</p>
        </div>
      )}
    </div>
  );
};

export default UploadScreen;
