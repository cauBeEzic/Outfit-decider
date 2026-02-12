// Filter tags component for storage screen
import React, { useEffect, useRef, useState } from 'react';
import './FilterTags.css';

interface FilterTagsProps {
  allTags: string[];
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
}

const FilterTags: React.FC<FilterTagsProps> = ({
  allTags,
  selectedTags,
  onTagToggle,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const toggleDropdown = () => {
    setOpen((prev) => !prev);
  };

  const label = selectedTags.length
    ? `Selected tags (${selectedTags.length})`
    : 'Select tags';

  return (
    <div className="filter-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="filter-dropdown-toggle"
        onClick={toggleDropdown}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span>{label}</span>
        <span className="filter-dropdown-chevron" aria-hidden="true">
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div className="filter-dropdown-menu" role="menu">
          {allTags.length === 0 ? (
            <p className="filter-dropdown-empty">No tags added yet.</p>
          ) : (
            allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagToggle(tag)}
                className={`filter-tag ${selectedTags.includes(tag) ? 'selected' : ''}`}
                role="menuitemcheckbox"
                aria-checked={selectedTags.includes(tag)}
              >
                <span>{tag}</span>
                {selectedTags.includes(tag) && (
                  <span className="check-icon" aria-hidden="true">
                    ✓
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FilterTags;
