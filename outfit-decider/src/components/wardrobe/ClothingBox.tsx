// Clothing display box component
import React from 'react';
import { ClothingItem, ClothingType } from '@/types';
import './ClothingBox.css';

interface ClothingBoxProps {
  item?: ClothingItem;
  type: ClothingType;
  placeholderText: string;
  generatedImageUrl?: string | null;
}

const ClothingBox: React.FC<ClothingBoxProps> = ({
  item,
  type,
  placeholderText,
  generatedImageUrl,
}) => {
  // Show generated image if available, otherwise show item or placeholder
  const displayImageUrl = generatedImageUrl || item?.image_url;

  return (
    <div className="clothing-box">
      <wired-card elevation="2" className="clothing-card">
        {displayImageUrl ? (
          <img
            src={displayImageUrl}
            alt={`${type} clothing item`}
            className="clothing-image"
          />
        ) : (
          <div className="clothing-placeholder">
            <p>{placeholderText}</p>
          </div>
        )}
      </wired-card>
    </div>
  );
};

export default ClothingBox;