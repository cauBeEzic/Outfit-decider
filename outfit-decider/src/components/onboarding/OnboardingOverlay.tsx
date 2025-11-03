// Onboarding coachmark overlay
import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { ONBOARDING_STEPS } from '@/utils/constants';
import './OnboardingOverlay.css';

const HIGHLIGHT_PADDING = 12;
const TOOLTIP_OFFSET = 16;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const OnboardingOverlay: React.FC = () => {
  const {
    currentStep,
    activeStepIndex,
    isActive,
    isCompleting,
    goToNext,
    goToPrevious,
    skip,
  } = useOnboarding();
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const portalContainerRef = useRef<HTMLElement | null>(null);
  const nextButtonRef = useRef<HTMLButtonElement | null>(null);

  useLayoutEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    portalContainerRef.current = document.body;
  }, []);

  useLayoutEffect(() => {
    if (!currentStep || typeof document === 'undefined') {
      setTargetRect(null);
      setTargetElement(null);
      return;
    }

    let animationFrame: number;

    const resolveTarget = () => {
      const element = document.querySelector(currentStep.targetElement) as HTMLElement | null;
      setTargetElement(element ?? null);

      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
      } else {
        setTargetRect(null);
      }
    };

    resolveTarget();

    const handleUpdate = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(resolveTarget);
    };

    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);

    let mutationObserver: MutationObserver | null = null;

    if (typeof MutationObserver !== 'undefined') {
      mutationObserver = new MutationObserver(() => handleUpdate());
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
    };
  }, [currentStep]);

  useLayoutEffect(() => {
    if (!targetElement) return;

    targetElement.classList.add('onboarding-highlight-target');

    return () => {
      targetElement.classList.remove('onboarding-highlight-target');
    };
  }, [targetElement, currentStep]);

  useLayoutEffect(() => {
    if (nextButtonRef.current) {
      nextButtonRef.current.focus();
    }
  }, [activeStepIndex]);

  const highlightStyle = useMemo(() => {
    if (!targetRect) {
      return { opacity: 0 };
    }

    return {
      top: targetRect.top - HIGHLIGHT_PADDING,
      left: targetRect.left - HIGHLIGHT_PADDING,
      width: targetRect.width + HIGHLIGHT_PADDING * 2,
      height: targetRect.height + HIGHLIGHT_PADDING * 2,
      opacity: 1,
    };
  }, [targetRect]);

  const tooltipStyle = useMemo(() => {
    if (!currentStep) return { display: 'none' };

    const fallback = {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    } as const;

    if (!targetRect || typeof window === 'undefined') {
      return fallback;
    }

    let top: number;
    let left: number;
    let transform: string;

    switch (currentStep.position) {
      case 'top':
        top = targetRect.top - TOOLTIP_OFFSET;
        left = targetRect.left + targetRect.width / 2;
        transform = 'translate(-50%, -100%)';
        break;
      case 'bottom':
        top = targetRect.bottom + TOOLTIP_OFFSET;
        left = targetRect.left + targetRect.width / 2;
        transform = 'translate(-50%, 0)';
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2;
        left = targetRect.left - TOOLTIP_OFFSET;
        transform = 'translate(-100%, -50%)';
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2;
        left = targetRect.right + TOOLTIP_OFFSET;
        transform = 'translate(0, -50%)';
        break;
      default:
        return fallback;
    }

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    top = clamp(top, 24, viewportHeight - 24);
    left = clamp(left, 24, viewportWidth - 24);

    return {
      top,
      left,
      transform,
    };
  }, [currentStep, targetRect]);

  if (!isActive || !currentStep || !portalContainerRef.current) {
    return null;
  }

  const totalSteps = ONBOARDING_STEPS.length;
  const currentStepNumber = (activeStepIndex ?? 0) + 1;
  const isFirstStep = (activeStepIndex ?? 0) === 0;
  const isLastStep = (activeStepIndex ?? 0) === totalSteps - 1;
  const titleId = `onboarding-title-${currentStep.step}`;
  const descriptionId = `onboarding-description-${currentStep.step}`;

  const handleNext = async () => {
    try {
      await goToNext();
    } catch (error) {
      alert('Unable to complete onboarding right now. Please try again.');
    }
  };

  const handleSkip = async () => {
    try {
      await skip();
    } catch (error) {
      alert('Unable to skip onboarding right now. Please try again.');
    }
  };

  return createPortal(
    <div
      className="onboarding-overlay"
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div
        className="onboarding-highlight"
        style={highlightStyle}
        aria-hidden="true"
      />

      <div
        className="onboarding-tooltip"
        style={tooltipStyle}
        role="document"
      >
        <p className="onboarding-step-label">
          Step {currentStepNumber} of {totalSteps}
        </p>
        <h2 className="onboarding-title" id={titleId}>
          {currentStep.title}
        </h2>
        <p className="onboarding-description" id={descriptionId}>
          {currentStep.description}
        </p>

        <div className="onboarding-actions">
          <button
            type="button"
            className="onboarding-button secondary"
            onClick={goToPrevious}
            disabled={isFirstStep}
          >
            Back
          </button>
          <button
            type="button"
            className="onboarding-button"
            ref={nextButtonRef}
            onClick={handleNext}
            disabled={isCompleting}
          >
            {isLastStep ? (isCompleting ? 'Finishing…' : 'Finish') : 'Next'}
          </button>
        </div>

        <button
          type="button"
          className="onboarding-skip"
          onClick={handleSkip}
          disabled={isCompleting}
        >
          Skip tour
        </button>
      </div>
    </div>,
    portalContainerRef.current,
  );
};

export default OnboardingOverlay;
