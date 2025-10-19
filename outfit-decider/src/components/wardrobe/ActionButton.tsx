// Action buttons grid (2x2)
import React from 'react';
import WiredButton from '@/components/shared/WiredButton';
import { PLACEHOLDER_MESSAGES } from '@/utils/constants';
import './ActionButtons.css';

interface ActionButtonsProps {
  onRandom: () => void;
  onDescribe: () => void;
  onGenerate: () => void;
  onSaveRating: () => void;
  randomDisabled: boolean;
  describeDisabled: boolean;
  generateDisabled: boolean;
  saveRatingDisabled: boolean;
  generating: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onRandom,
  onDescribe,
  onGenerate,
  onSaveRating,
  randomDisabled,
  describeDisabled,
  generateDisabled,
  saveRatingDisabled,
  generating,
}) => {
  return (
    <div className="action-buttons">
      <div className="button-row">
        <WiredButton
          onClick={onRandom}
          disabled={randomDisabled}
          className="action-btn"
        >
          Random
        </WiredButton>
        
        <WiredButton
          onClick={onDescribe}
          disabled={describeDisabled}
          className="action-btn"
          title={describeDisabled ? PLACEHOLDER_MESSAGES.UPLOAD_BOTH_ITEMS : ''}
        >
          Describe
        </WiredButton>
      </div>

      <div className="button-row">
        <WiredButton
          onClick={onGenerate}
          disabled={generateDisabled || generating}
          className="action-btn generate-button"
          title={generateDisabled ? PLACEHOLDER_MESSAGES.UPLOAD_PHOTO_FIRST : ''}
        >
          {generating ? 'Generating...' : 'Generate'}
        </WiredButton>
        
        <WiredButton
          onClick={onSaveRating}
          disabled={saveRatingDisabled}
          className="action-btn save-rating-button"
        >
          Save/Rating
        </WiredButton>
      </div>
    </div>
  );
};

export default ActionButtons;