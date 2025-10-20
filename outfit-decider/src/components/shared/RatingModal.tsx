// Rating modal for saving outfits
import React, { useState } from 'react';
import WiredButton from './WiredButton';
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
      <div className="rating-modal">
        <wired-card elevation="3">
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
            <WiredButton onClick={handleSkip} className="modal-button">
              Skip
            </WiredButton>
            <WiredButton onClick={handleSave} className="modal-button">
              Save
            </WiredButton>
          </div>

          <button onClick={onCancel} className="cancel-link">
            Cancel
          </button>
        </wired-card>
      </div>
    </div>
  );
};

export default RatingModal;