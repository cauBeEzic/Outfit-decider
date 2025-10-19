/// <reference path="../../types/wired-elements.d.ts" />
// Custom WiredJS button wrapper component
import React, { useEffect, useRef } from 'react';

interface WiredButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  elevation?: number;
  type?: 'button' | 'submit';
  style?: React.CSSProperties;
  title?: string; // ADD THIS LINE
}

const WiredButton: React.FC<WiredButtonProps> = ({
  children,
  onClick,
  disabled = false,
  className = '',
  elevation = 2,
  type = 'button',
  style = {},
  title, // ADD THIS LINE
}) => {
  const buttonRef = useRef<any>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    // Find parent form if type is submit
    if (type === 'submit' && buttonRef.current) {
      let element = buttonRef.current.parentElement;
      while (element && element.tagName !== 'FORM') {
        element = element.parentElement;
      }
      formRef.current = element as HTMLFormElement;
    }
  }, [type]);

  useEffect(() => {
    // WiredJS elements need to be accessed after mount
    if (buttonRef.current) {
      buttonRef.current.elevation = elevation;
      buttonRef.current.disabled = disabled;
    }
  }, [elevation, disabled]);

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    
    // If type is submit, trigger form submission
    if (type === 'submit' && formRef.current) {
      e.preventDefault();
      formRef.current.requestSubmit();
      return;
    }
    
    if (onClick) {
      onClick();
    }
  };

  return (
    <wired-button
      ref={buttonRef}
      onClick={handleClick}
      className={className}
      title={title} // ADD THIS LINE
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {children}
    </wired-button>
  );
};

export default WiredButton;