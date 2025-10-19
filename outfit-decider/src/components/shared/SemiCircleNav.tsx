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
      className={`semi-circle-nav semi-circle-${direction} ${className}`}
      onClick={onClick}
      aria-label={`Navigate ${direction}`}
    >
      <svg
        width="40"
        height="80"
        viewBox="0 0 40 80"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        {direction === 'right' ? (
          <>
            {/* Semi-circle with vertical line on left */}
            {/* <path d="M 0 0 L 0 80" /> */}
            <path d="M 0 40 A 30 30 0 0 1 30 10 L 30 70 A 30 30 0 0 1 0 40" fill="white" />
            {/* Arrow pointing right */}
            <polyline points="15 30 25 40 15 50" strokeWidth="3" />
          </>
        ) : (
          <>
            {/* Semi-circle with vertical line on right */}
            <path d="M 40 0 L 40 80" />
            <path d="M 40 40 A 30 30 0 0 0 10 10 L 10 70 A 30 30 0 0 0 40 40" fill="white" />
            {/* Arrow pointing left */}
            <polyline points="25 30 15 40 25 50" strokeWidth="3" />
          </>
        )}
      </svg>
    </button>
  );
};

export default SemiCircleNav;