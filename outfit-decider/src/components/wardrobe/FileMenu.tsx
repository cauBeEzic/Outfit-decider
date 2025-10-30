// File menu dropdown component
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FileMenu.css';

interface FileMenuProps {
  className?: string;
}

const FileMenu: React.FC<FileMenuProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuClick = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <div className={`file-menu-container ${className}`}>
      <button
        className="file-menu-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="File menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
          <polyline points="13 2 13 9 20 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="menu-overlay" onClick={() => setIsOpen(false)} />
          <div className="file-menu-dropdown">
            <div className="xp-menu-window">
              <button
                className="menu-item"
                onClick={() => handleMenuClick('/upload/top')}
              >
                Upload Top
              </button>
              <button
                className="menu-item"
                onClick={() => handleMenuClick('/upload/bottom')}
              >
                Upload Bottom
              </button>
              <button
                className="menu-item"
                onClick={() => handleMenuClick('/storage')}
              >
                Storage
              </button>
              <button
                className="menu-item"
                onClick={() => handleMenuClick('/saved-outfits')}
              >
                Saved Outfits
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FileMenu;
