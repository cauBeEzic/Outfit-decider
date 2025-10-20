// Filter tags component for storage screen
import React from 'react';
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
  return (
    <div className="filter-tags">
      {allTags.map(tag => (
        <button
          key={tag}
          onClick={() => onTagToggle(tag)}
          className={`filter-tag ${selectedTags.includes(tag) ? 'selected' : ''}`}
        >
          {tag}
          {selectedTags.includes(tag) && (
            <span className="check-icon">✓</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default FilterTags;