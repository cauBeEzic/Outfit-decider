// Modal for AI describe feature
import React, { useEffect, useMemo, useState } from 'react';
import { ClothingItem } from '@/types';
import './DescribeModal.css';

interface DescribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (options: {
    prompt: string;
    includeSelectedPieces: boolean;
    includeSelectedTags: boolean;
  }) => Promise<void>;
  isSubmitting: boolean;
  error: string | null;
  suggestion: {
    top: ClothingItem | null;
    bottom: ClothingItem | null;
    reasoning?: string;
  } | null;
  onApplySuggestion: () => void;
  onResetSuggestion: () => void;
  currentTop: ClothingItem | null;
  currentBottom: ClothingItem | null;
}

const DescribeModal: React.FC<DescribeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  error,
  suggestion,
  onApplySuggestion,
  onResetSuggestion,
  currentTop,
  currentBottom,
}) => {
  const [prompt, setPrompt] = useState('');
  const [includeSelectedPieces, setIncludeSelectedPieces] = useState(true);
  const [includeSelectedTags, setIncludeSelectedTags] = useState(true);
  const [viewMode, setViewMode] = useState<'prompt' | 'suggestion'>('prompt');
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPrompt('');
      setIncludeSelectedPieces(true);
      setIncludeSelectedTags(true);
      setViewMode('prompt');
    }
  }, [isOpen]);

  useEffect(() => {
    if (suggestion) {
      setViewMode('suggestion');
    } else {
      setViewMode('prompt');
    }
  }, [suggestion]);

  useEffect(() => {
    if (isOpen && viewMode === 'prompt' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen, viewMode]);

  const currentSelectionSummary = useMemo(() => {
    const parts: string[] = [];
    if (currentTop) {
      parts.push(
        [
          'Top',
          currentTop.tags?.length ? currentTop.tags.join(', ') : 'No tags added yet',
        ].join(': '),
      );
    }
    if (currentBottom) {
      parts.push(
        [
          'Bottom',
          currentBottom.tags?.length ? currentBottom.tags.join(', ') : 'No tags added yet',
        ].join(': '),
      );
    }
    return parts.join(' • ');
  }, [currentBottom, currentTop]);

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({ prompt, includeSelectedPieces, includeSelectedTags });
  };

  const handlePromptKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!isSubmitting) {
        void onSubmit({ prompt, includeSelectedPieces, includeSelectedTags });
      }
    }
  };

  const handleTryAnother = () => {
    onResetSuggestion();
    setViewMode('prompt');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="describe-modal-overlay">
      <div className="describe-modal window" role="dialog" aria-modal="true">
        <div className="title-bar">
          <div className="title-bar-text">Describe Outfit</div>
          <div className="title-bar-controls">
            <button
              type="button"
              aria-label="Close"
              onClick={handleClose}
              className="title-bar-close"
            >
              &times;
            </button>
          </div>
        </div>

        <form className="window-body describe-window-body" onSubmit={handleSubmit}>
          {viewMode === 'prompt' && (
            <>
              <h2 className="describe-title">Describe your outfit idea</h2>

              <label htmlFor="describe-prompt" className="describe-label">
                Give us the vibe or occasion
              </label>
              <textarea
                id="describe-prompt"
                className="describe-textarea"
                placeholder="Casual brunch look with light denim"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={handlePromptKeyDown}
                rows={3}
                disabled={isSubmitting}
                ref={textareaRef}
              />

              <div className="describe-options">
                <label
                  className={`describe-checkbox${isSubmitting ? ' disabled' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={includeSelectedPieces}
                    onChange={(event) => setIncludeSelectedPieces(event.target.checked)}
                    disabled={isSubmitting}
                  />
                  <span className="describe-checkbox-box" aria-hidden="true" />
                  <span className="describe-checkbox-text">Reference my current selection</span>
                </label>
                <label
                  className={`describe-checkbox${isSubmitting ? ' disabled' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={includeSelectedTags}
                    onChange={(event) => setIncludeSelectedTags(event.target.checked)}
                    disabled={isSubmitting}
                  />
                  <span className="describe-checkbox-box" aria-hidden="true" />
                  <span className="describe-checkbox-text">Prioritize tags from selected items</span>
                </label>
              </div>

              {includeSelectedPieces && currentSelectionSummary && (
                <div className="describe-current-selection">
                  <span className="describe-current-label">Current selection</span>
                  <p>{currentSelectionSummary}</p>
                </div>
              )}

              {error && <p className="describe-error">{error}</p>}

              <div className="describe-submit-row">
                <button
                  type="submit"
                  className="button modal-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Thinking…' : 'Get suggestion'}
                </button>
              </div>
            </>
          )}

          {viewMode === 'suggestion' && suggestion && (
            <div className="describe-suggestion">
              <h3 className="describe-suggestion-title">Suggested pairing</h3>
              <div className="describe-suggestion-grid">
                <div className="describe-suggestion-card">
                  <span className="describe-suggestion-heading">Top</span>
                  {suggestion.top ? (
                    <>
                      <img
                        src={suggestion.top.image_url}
                        alt="Suggested top"
                        className="describe-suggestion-image"
                      />
                      <p className="describe-suggestion-tags">
                        {suggestion.top.tags?.length
                          ? suggestion.top.tags.join(', ')
                          : 'No tags'}
                      </p>
                    </>
                  ) : (
                    <p className="describe-missing">No top suggested</p>
                  )}
                </div>
                <div className="describe-suggestion-card">
                  <span className="describe-suggestion-heading">Bottom</span>
                  {suggestion.bottom ? (
                    <>
                      <img
                        src={suggestion.bottom.image_url}
                        alt="Suggested bottom"
                        className="describe-suggestion-image"
                      />
                      <p className="describe-suggestion-tags">
                        {suggestion.bottom.tags?.length
                          ? suggestion.bottom.tags.join(', ')
                          : 'No tags'}
                      </p>
                    </>
                  ) : (
                    <p className="describe-missing">No bottom suggested</p>
                  )}
                </div>
              </div>
              {suggestion.reasoning && (
                <p className="describe-reasoning">{suggestion.reasoning}</p>
              )}
              <div className="describe-actions">
                <button
                  type="button"
                  className="button modal-button secondary"
                  onClick={handleTryAnother}
                  disabled={isSubmitting}
                >
                  Try another idea
                </button>
                <button
                  type="button"
                  className="button modal-button"
                  onClick={onApplySuggestion}
                  disabled={isSubmitting}
                >
                  Use this outfit
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default DescribeModal;
