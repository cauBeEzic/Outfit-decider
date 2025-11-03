// XP.css-based action buttons for the wardrobe screen
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PLACEHOLDER_MESSAGES } from '@/utils/constants';
import './ActionButtons.css';

interface ActionButtonsProps {
  onRandom: () => void;
  onDescribe: () => void;
  onGenerate: () => void;
  randomDisabled: boolean;
  describeDisabled: boolean;
  generateDisabled: boolean;
  generating: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onRandom,
  onDescribe,
  onGenerate,
  randomDisabled,
  describeDisabled,
  generateDisabled,
  generating,
}) => {
  const [progressValue, setProgressValue] = useState(0);
  const [progressLabel, setProgressLabel] = useState('Generate');
  const progressRef = useRef<HTMLProgressElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const previousGeneratingRef = useRef(generating);

  const clearAnimationInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const clearResetTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.value = progressValue;
    }
  }, [progressValue]);

  useEffect(() => {
    const previouslyGenerating = previousGeneratingRef.current;

    if (generating && !previouslyGenerating) {
      clearResetTimeout();
      setProgressLabel('Generating...');
      setProgressValue(0);

      clearAnimationInterval();
      intervalRef.current = window.setInterval(() => {
        setProgressValue((prev) => {
          if (prev >= 90) {
            return 90;
          }
          return prev + 2;
        });
      }, 120);
    } else if (!generating && previouslyGenerating) {
      clearAnimationInterval();
      setProgressValue(100);
      setProgressLabel('Done');

      clearResetTimeout();
      timeoutRef.current = window.setTimeout(() => {
        setProgressValue(0);
        setProgressLabel('Generate');
      }, 1500);
    }

    previousGeneratingRef.current = generating;
  }, [clearAnimationInterval, clearResetTimeout, generating]);

  useEffect(() => {
    return () => {
      clearAnimationInterval();
      clearResetTimeout();
    };
  }, [clearAnimationInterval, clearResetTimeout]);

  const handleGenerateActivate = () => {
    if (generateDisabled || generating) {
      return;
    }
    onGenerate();
  };

  const handleProgressKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (generateDisabled || generating) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onGenerate();
    }
  };

  return (
    <div className="action-buttons">
      <div className="button-row">
        <div className="action-slot">
          <button
            type="button"
            onClick={onRandom}
            disabled={randomDisabled}
            className="button action-button"
            title={randomDisabled ? PLACEHOLDER_MESSAGES.UPLOAD_PHOTO_FIRST : ''}
          >
            Random
          </button>
        </div>
        <div className="action-slot">
          <button
            type="button"
            onClick={onDescribe}
            disabled={describeDisabled}
            className="button action-button"
            title={describeDisabled ? PLACEHOLDER_MESSAGES.UPLOAD_BOTH_ITEMS : ''}
          >
            Describe
          </button>
        </div>
      </div>

      <div className="progress-row">
        <div
          className={[
            'generate-progress',
            'generate-button',
            generateDisabled ? 'disabled' : '',
            generating ? 'loading' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          role="button"
          tabIndex={generateDisabled || generating ? -1 : 0}
          aria-disabled={generateDisabled || generating}
          aria-busy={generating}
          aria-label={generating ? 'Generating outfit' : 'Generate outfit'}
          onClick={handleGenerateActivate}
          onKeyDown={handleProgressKeyDown}
          title={generateDisabled ? PLACEHOLDER_MESSAGES.UPLOAD_PHOTO_FIRST : undefined}
        >
          <div className="progress-wrapper">
            <progress
              ref={progressRef}
              className="progress"
              max={100}
              value={progressValue}
              aria-hidden="true"
            />
            <span className="progress-label">{progressLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;
