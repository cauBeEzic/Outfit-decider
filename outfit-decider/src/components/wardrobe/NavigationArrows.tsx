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
        onClick={onPrevious}
        className="arrow-button arrow-left"
        disabled={disabled}
        aria-label="Previous item"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <button
        onClick={onNext}
        className="arrow-button arrow-right"
        disabled={disabled}
        aria-label="Next item"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  );
};

export default NavigationArrows;