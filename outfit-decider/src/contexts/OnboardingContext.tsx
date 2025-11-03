// Onboarding walkthrough context
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ONBOARDING_STEPS } from '@/utils/constants';
import { useAuth } from '@/contexts/AuthContext';

const SESSION_STORAGE_KEY = 'outfit-decider:onboarding-step';

type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

interface OnboardingContextValue {
  activeStepIndex: number | null;
  currentStep: OnboardingStep | null;
  isActive: boolean;
  isCompleting: boolean;
  goToNext: () => Promise<void> | void;
  goToPrevious: () => void;
  skip: () => Promise<void> | void;
  start: () => void;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

const readStoredStep = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) return null;

  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) return null;

  if (parsed < 0 || parsed >= ONBOARDING_STEPS.length) {
    return null;
  }

  return parsed;
};

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, onboardingCompleted, markOnboardingComplete, loading } = useAuth();
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const completionPromiseRef = useRef<Promise<void> | null>(null);

  // Start onboarding once auth state is ready
  useEffect(() => {
    if (loading) return;

    if (!user || onboardingCompleted) {
      setActiveStepIndex(null);
      setStarted(false);
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
      return;
    }

    if (!started) {
      const stored = readStoredStep();
      setActiveStepIndex(stored ?? 0);
      setStarted(true);
    }
  }, [loading, onboardingCompleted, started, user]);

  // Keep session storage in sync
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (activeStepIndex === null) {
      window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } else {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, String(activeStepIndex));
    }
  }, [activeStepIndex]);

  const completeOnboarding = useCallback(async () => {
    if (isCompleting && completionPromiseRef.current) {
      return completionPromiseRef.current;
    }

    const completionTask = (async () => {
      setIsCompleting(true);
      try {
        await markOnboardingComplete();
        setActiveStepIndex(null);
        setStarted(false);
        if (typeof window !== 'undefined') {
          window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
      } catch (error) {
        console.error('Failed to mark onboarding complete:', error);
        throw error;
      } finally {
        setIsCompleting(false);
        completionPromiseRef.current = null;
      }
    })();

    completionPromiseRef.current = completionTask;
    return completionTask;
  }, [isCompleting, markOnboardingComplete]);

  const goToNext = useCallback(async () => {
    if (activeStepIndex === null) {
      setActiveStepIndex(0);
      return;
    }

    const nextIndex = activeStepIndex + 1;
    if (nextIndex >= ONBOARDING_STEPS.length) {
      await completeOnboarding();
    } else {
      setActiveStepIndex(nextIndex);
    }
  }, [activeStepIndex, completeOnboarding]);

  const goToPrevious = useCallback(() => {
    if (activeStepIndex === null) {
      return;
    }

    setActiveStepIndex((prev) => {
      if (prev === null) return prev;
      if (prev <= 0) return 0;
      return prev - 1;
    });
  }, [activeStepIndex]);

  const skip = useCallback(async () => {
    await completeOnboarding();
  }, [completeOnboarding]);

  const start = useCallback(() => {
    if (started || onboardingCompleted || loading || !user) {
      return;
    }

    setActiveStepIndex(0);
    setStarted(true);
  }, [loading, onboardingCompleted, started, user]);

  const value = useMemo<OnboardingContextValue>(() => {
    const currentStep =
      activeStepIndex === null ? null : ONBOARDING_STEPS[activeStepIndex] ?? null;

    return {
      activeStepIndex,
      currentStep,
      isActive: activeStepIndex !== null,
      isCompleting,
      goToNext,
      goToPrevious,
      skip,
      start,
    };
  }, [activeStepIndex, goToNext, goToPrevious, isCompleting, skip, start]);

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
