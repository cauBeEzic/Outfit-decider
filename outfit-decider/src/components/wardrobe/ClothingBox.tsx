// Clothing display box component
import React from 'react';
import { ClothingItem, ClothingType } from '@/types';
import './ClothingBox.css';

interface ClothingBoxProps {
  item?: ClothingItem;
  type: ClothingType;
  placeholderText: string;
}

const ClothingBox: React.FC<ClothingBoxProps> = ({
  item,
  type,
  placeholderText,
}) => {
  const displayImageUrl = item?.image_url;

  return (
    <div className="clothing-box">
      <div className="xp-window clothing-card">
        <div className="xp-window-body">
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
        </div>
      </div>
    </div>
  );
};

export default ClothingBox;
