// XP.css tag input modal component
import React, { useState } from 'react';
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

    if (tags.includes(trimmedTag)) {
      setInputValue('');
      return;
    }

    setTags([...tags, trimmedTag]);
    setInputValue('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
      <div className="tag-input-modal window" role="dialog" aria-modal="true">
        <div className="title-bar">
          <div className="title-bar-text">Add Tags</div>
          <div className="title-bar-controls">
            <button
              type="button"
              aria-label="Close"
              className="title-bar-close"
              onClick={onCancel}
            >
              &times;
            </button>
          </div>
        </div>
        <div className="window-body tag-window-body">
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
              className="text-input tag-text-input"
              autoFocus
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="button add-tag-button"
              disabled={!inputValue.trim()}
            >
              Add
            </button>
          </div>

          {tags.length > 0 && (
            <div className="current-tags">
              {tags.map((tag, index) => (
                <div key={index} className="tag-item">
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="remove-tag-button"
                    aria-label={`Remove ${tag}`}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              onClick={onCancel}
              className="button modal-button"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="button modal-button"
            >
              Save Tags
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagInput;
