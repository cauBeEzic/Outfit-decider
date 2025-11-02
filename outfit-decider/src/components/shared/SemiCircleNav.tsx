// Semi-circle navigation component
import React from 'react';
import './SemiCircleNav.css';

interface SemiCircleNavProps {
  direction: 'left' | 'right';
  onClick: () => void;
  className?: string;
}

const SemiCircleNav: React.FC<SemiCircleNavProps> = ({
  direction,
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      className={`semi-circle-nav semi-circle-${direction} ${className}`}
      onClick={onClick}
      aria-label={`Navigate ${direction}`}
    >
      <span className="semi-circle-arrow" aria-hidden="true">
        {direction === 'right' ? '►' : '◄'}
      </span>
    </button>
  );
};

export default SemiCircleNav;
