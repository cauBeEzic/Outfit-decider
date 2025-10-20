// Outfit card component - displays saved outfit with rating
import React, { useState } from 'react';
import { SavedOutfitWithItems } from '@/types';
import './OutfitCard.css';

interface OutfitCardProps {
  outfit: SavedOutfitWithItems;
  onDelete: () => void;
}

const OutfitCard: React.FC<OutfitCardProps> = ({ outfit, onDelete }) => {
  const [showGallery, setShowGallery] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const mostRecentPhoto = outfit.generated_photos[0];

  const handleCardClick = () => {
    if (outfit.generated_photos.length > 0) {
      setShowGallery(true);
    }
  };

  const handlePreviousPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => 
      prev === 0 ? outfit.generated_photos.length - 1 : prev - 1
    );
  };

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentPhotoIndex((prev) => 
      prev === outfit.generated_photos.length - 1 ? 0 : prev + 1
    );
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : ''}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="outfit-card-container">
        <div 
          className="outfit-polaroid"
          onClick={handleCardClick}
          style={{ cursor: outfit.generated_photos.length > 0 ? 'pointer' : 'default' }}
        >
          {mostRecentPhoto ? (
            <div className="outfit-image-container">
              <img 
                src={mostRecentPhoto.image_url} 
                alt="Generated outfit" 
                className="outfit-image" 
              />
              {outfit.generated_photos.length > 1 && (
                <div className="photo-count-badge">
                  {outfit.generated_photos.length} photos
                </div>
              )}
            </div>
          ) : (
            <div className="no-photo-placeholder">
              <p>No generated photo</p>
            </div>
          )}
          
          <div className="outfit-info">
            {renderStars(outfit.rating)}
            
            <div className="outfit-items">
              <div className="item-label">
                <strong>Top:</strong> {outfit.top ? outfit.top.tags.join(', ') || 'No tags' : 'None chosen'}
              </div>
              <div className="item-label">
                <strong>Bottom:</strong> {outfit.bottom ? outfit.bottom.tags.join(', ') || 'No tags' : 'None chosen'}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onDelete}
          className="delete-outfit-btn"
          aria-label="Delete outfit"
        >
          Delete
        </button>
      </div>

      {/* Gallery modal */}
      {showGallery && (
        <div className="gallery-overlay" onClick={() => setShowGallery(false)}>
          <div className="gallery-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="gallery-close"
              onClick={() => setShowGallery(false)}
            >
              ×
            </button>

            <div className="gallery-image-container">
              {outfit.generated_photos.length > 1 && (
                <button
                  className="gallery-nav gallery-prev"
                  onClick={handlePreviousPhoto}
                >
                  ‹
                </button>
              )}

              <img
                src={outfit.generated_photos[currentPhotoIndex].image_url}
                alt={`Generated outfit ${currentPhotoIndex + 1}`}
                className="gallery-image"
              />

              {outfit.generated_photos.length > 1 && (
                <button
                  className="gallery-nav gallery-next"
                  onClick={handleNextPhoto}
                >
                  ›
                </button>
              )}
            </div>

            <div className="gallery-info">
              <p className="gallery-counter">
                Photo {currentPhotoIndex + 1} of {outfit.generated_photos.length}
              </p>
              
              <div className="gallery-items">
                <h3>Items in this outfit:</h3>
                {outfit.top && (
                  <div className="gallery-item">
                    <img src={outfit.top.image_url} alt="Top" />
                    <div className="item-tags">
                      {outfit.top.tags.map((tag: string, i: number) => (
                        <span key={i} className="tag-badge">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
                {outfit.bottom && (
                  <div className="gallery-item">
                    <img src={outfit.bottom.image_url} alt="Bottom" />
                    <div className="item-tags">
                      {outfit.bottom.tags.map((tag: string, i: number) => (
                        <span key={i} className="tag-badge">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
                {!outfit.top && !outfit.bottom && (
                  <p className="no-items">No items saved with this outfit</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OutfitCard;