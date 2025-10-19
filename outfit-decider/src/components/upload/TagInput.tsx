// Tag input modal component
import React, { useState } from 'react';
import WiredButton from '@/components/shared/WiredButton';
import './TagInput.css';

interface TagInputProps {
  existingTags: string[];
  onSave: (tags: string[]) => void;
  onCancel: () => void;
}

const TagInput: React.FC<TagInputProps> = ({ existingTags, onSave, onCancel }) => {
  const [tags, setTags] = useState<string[]>(existingTags);
  const [inputValue, setInputValue] = useState('');

  const handleAddTag = () => {
    const trimmedTag = inputValue.trim().toLowerCase();
    
    if (!trimmedTag) return;
    
    // Don't add duplicates
    if (tags.includes(trimmedTag)) {
      setInputValue('');
      return;
    }

    setTags([...tags, trimmedTag]);
    setInputValue('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSave = () => {
    onSave(tags);
  };

  return (
    <div className="tag-input-overlay">
      <div className="tag-input-modal">
        <wired-card elevation="3">
          <h2 className="modal-title">Add Tags</h2>
          <p className="modal-description">
            Add tags to help organize and find this item later
          </p>

          <div className="input-container">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a tag and press Enter"
              className="tag-text-input"
              autoFocus
            />
            <button
              onClick={handleAddTag}
              className="add-tag-button"
              disabled={!inputValue.trim()}
            >
              Add
            </button>
          </div>

          {/* Display current tags */}
          {tags.length > 0 && (
            <div className="current-tags">
              {tags.map((tag, index) => (
                <div key={index} className="tag-item">
                  <span>{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="remove-tag-button"
                    aria-label={`Remove ${tag}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="modal-actions">
            <WiredButton onClick={onCancel} className="modal-button">
              Cancel
            </WiredButton>
            <WiredButton onClick={handleSave} className="modal-button">
              Save Tags
            </WiredButton>
          </div>
        </wired-card>
      </div>
    </div>
  );
};

export default TagInput;