// Rating modal for saving outfits
import React, { useState } from 'react';
import './RatingModal.css';

interface RatingModalProps {
  onSave: (rating: number | null) => void;
  onCancel: () => void;
}

const RatingModal: React.FC<RatingModalProps> = ({ onSave, onCancel }) => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleStarHover = (rating: number) => {
    setHoveredRating(rating);
  };

  const handleStarLeave = () => {
    setHoveredRating(null);
  };

  const handleSave = () => {
    onSave(selectedRating);
  };

  const handleSkip = () => {
    onSave(null);
  };

  const displayRating = hoveredRating || selectedRating || 0;

  return (
    <div className="rating-modal-overlay">
      <div className="rating-modal window" role="dialog" aria-modal="true">
        <div className="title-bar">
          <div className="title-bar-text">Save Outfit</div>
          <div className="title-bar-controls">
            <button
              type="button"
              aria-label="Close"
              onClick={onCancel}
              className="title-bar-close"
            >
              &times;
            </button>
          </div>
        </div>
        <div className="window-body rating-window-body">
          <h2 className="modal-title">Save Outfit</h2>
          <p className="modal-description">
            Rate this outfit (optional)
          </p>

          <div className="stars-container">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`star-button ${star <= displayRating ? 'active' : ''}`}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => handleStarHover(star)}
                onMouseLeave={handleStarLeave}
                aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                type="button"
              >
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill={star <= displayRating ? '#ffd700' : 'none'}
                  stroke={star <= displayRating ? '#ffd700' : '#ddd'}
                  strokeWidth="2"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </button>
            ))}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={handleSkip}
              className="button modal-button"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="button modal-button"
            >
              Save
            </button>
          </div>

          <button onClick={onCancel} className="cancel-link" type="button">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
