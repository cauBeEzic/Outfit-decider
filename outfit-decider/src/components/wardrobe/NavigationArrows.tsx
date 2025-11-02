// Navigation arrows for cycling through clothing items
import React from 'react';
import './NavigationArrows.css';

interface NavigationArrowsProps {
  onPrevious: () => void;
  onNext: () => void;
  disabled: boolean;
  position: 'top' | 'bottom';
}

const NavigationArrows: React.FC<NavigationArrowsProps> = ({
  onPrevious,
  onNext,
  disabled,
  position,
}) => {
  return (
    <div className={`navigation-arrows navigation-arrows-${position}`}>
      <button
        type="button"
        onClick={onPrevious}
        className="button xp-arrow-button arrow-left"
        disabled={disabled}
        aria-label="Previous item"
      >
        <span className="arrow-icon" aria-hidden="true">◄</span>
      </button>

      <button
        type="button"
        onClick={onNext}
        className="button xp-arrow-button arrow-right"
        disabled={disabled}
        aria-label="Next item"
      >
        <span className="arrow-icon" aria-hidden="true">►</span>
      </button>
    </div>
  );
};

export default NavigationArrows;
