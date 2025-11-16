// Main wardrobe screen with clothing boxes and actions
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNanoBanana } from '@/hooks/useNanoBanana';
import ClothingBox from '@/components/wardrobe/ClothingBox';
import NavigationArrows from '@/components/wardrobe/NavigationArrows';
import ActionButtons from '@/components/wardrobe/ActionButtons';
import FileMenu from '@/components/wardrobe/FileMenu';
import DescribeModal from '@/components/wardrobe/DescribeModal';
import SemiCircleNav from '@/components/shared/SemiCircleNav';
import { ClothingItem } from '@/types';
import { supabase } from '@/lib/supabase';
import { PLACEHOLDER_MESSAGES } from '@/utils/constants';
import './WardrobeScreen.css';

const WardrobeScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    generateTryOn,
    getSuggestion,
    generating: nanoBanaGenerating,
    suggesting: nanoBanaSuggesting,
    error: nanoBanaError,
  } = useNanoBanana(user?.id);

  // State for clothing items
  const [tops, setTops] = useState<ClothingItem[]>([]);
  const [bottoms, setBottoms] = useState<ClothingItem[]>([]);
  const [currentTopIndex, setCurrentTopIndex] = useState(0);
  const [currentBottomIndex, setCurrentBottomIndex] = useState(0);
  
  // State for user photo
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [describeModalOpen, setDescribeModalOpen] = useState(false);
  const [describeError, setDescribeError] = useState<string | null>(null);
  const [describeSuggestion, setDescribeSuggestion] = useState<{
    top: ClothingItem | null;
    bottom: ClothingItem | null;
    reasoning?: string;
  } | null>(null);
  const [nanoErrorContext, setNanoErrorContext] = useState<'generate' | 'describe' | null>(null);

  // Combine loading states
  const isGenerating = generating || nanoBanaGenerating;
  const isSuggesting = nanoBanaSuggesting;

  const topOptions = useMemo<(ClothingItem | null)[]>(() => [null, ...tops], [tops]);
  const bottomOptions = useMemo<(ClothingItem | null)[]>(() => [null, ...bottoms], [bottoms]);
  const topOptionCount = topOptions.length;
  const bottomOptionCount = bottomOptions.length;

  useEffect(() => {
    if (currentTopIndex >= topOptionCount) {
      setCurrentTopIndex(Math.max(0, topOptionCount - 1));
    }
  }, [currentTopIndex, topOptionCount]);

  useEffect(() => {
    if (currentBottomIndex >= bottomOptionCount) {
      setCurrentBottomIndex(Math.max(0, bottomOptionCount - 1));
    }
  }, [currentBottomIndex, bottomOptionCount]);

  // Load user's wardrobe on mount
  useEffect(() => {
    loadWardrobe();
    loadUserPhoto();
  }, [user]);

  const loadWardrobe = async () => {
    if (!user) return;

    try {
      // Load tops
      const { data: topsData, error: topsError } = await supabase
        .from('clothing_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'top')
        .order('created_at', { ascending: false });

      if (topsError) throw topsError;
      const resolvedTops = topsData || [];
      setTops(resolvedTops);

      // Load bottoms
      const { data: bottomsData, error: bottomsError } = await supabase
        .from('clothing_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'bottom')
        .order('created_at', { ascending: false });

      if (bottomsError) throw bottomsError;
      const resolvedBottoms = bottomsData || [];
      setBottoms(resolvedBottoms);

      // Load last viewed preferences
      const { data: prefsData } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      let nextTopIndex = resolvedTops.length > 0 ? 1 : 0;
      let nextBottomIndex = resolvedBottoms.length > 0 ? 1 : 0;

      if (prefsData) {
        if (prefsData.last_viewed_top_id && resolvedTops.length > 0) {
          const topIndex = resolvedTops.findIndex(t => t.id === prefsData.last_viewed_top_id);
          if (topIndex !== -1) {
            nextTopIndex = topIndex + 1;
          }
        } else if (prefsData.last_viewed_top_id === null) {
          nextTopIndex = 0;
        }

        if (prefsData.last_viewed_bottom_id && resolvedBottoms.length > 0) {
          const bottomIndex = resolvedBottoms.findIndex(b => b.id === prefsData.last_viewed_bottom_id);
          if (bottomIndex !== -1) {
            nextBottomIndex = bottomIndex + 1;
          }
        } else if (prefsData.last_viewed_bottom_id === null) {
          nextBottomIndex = 0;
        }
      }

      setCurrentTopIndex(nextTopIndex);
      setCurrentBottomIndex(nextBottomIndex);
    } catch (error) {
      console.error('Error loading wardrobe:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserPhoto = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_photos')
      .select('image_url')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setUserPhotoUrl(data.image_url);
    }
  };

  const backupOriginalPhoto = async () => {
    if (typeof window === 'undefined' || !userPhotoUrl) {
      return;
    }

    try {
      if (sessionStorage.getItem('originalUserPhotoData')) {
        return;
      }

      const response = await fetch(userPhotoUrl, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to fetch original photo');
      }

      const blob = await response.blob();
      const reader = new FileReader();

      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read original photo blob'));
        reader.readAsDataURL(blob);
      });

      sessionStorage.setItem('originalUserPhotoData', dataUrl);
      sessionStorage.setItem('originalUserPhotoSource', userPhotoUrl);
    } catch (error) {
      console.error('Failed to back up original user photo:', error);
    }
  };

  // Save current view state
  const saveCurrentView = async (
    topOverride?: ClothingItem | null,
    bottomOverride?: ClothingItem | null,
  ) => {
    if (!user) return;

    const selectedTop = topOverride ?? topOptions[currentTopIndex] ?? null;
    const selectedBottom = bottomOverride ?? bottomOptions[currentBottomIndex] ?? null;

    await supabase
      .from('user_preferences')
      .upsert(
        {
          user_id: user.id,
          last_viewed_top_id: selectedTop?.id || null,
          last_viewed_bottom_id: selectedBottom?.id || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
  };

  // Navigation handlers
  const handleTopPrevious = () => {
    if (topOptionCount > 1) {
      setCurrentTopIndex((prev) => {
        const nextIndex = (prev - 1 + topOptionCount) % topOptionCount;
        void saveCurrentView(topOptions[nextIndex], bottomOptions[currentBottomIndex] ?? null);
        return nextIndex;
      });
    }
  };

  const handleTopNext = () => {
    if (topOptionCount > 1) {
      setCurrentTopIndex((prev) => {
        const nextIndex = (prev + 1) % topOptionCount;
        void saveCurrentView(topOptions[nextIndex], bottomOptions[currentBottomIndex] ?? null);
        return nextIndex;
      });
    }
  };

  const handleBottomPrevious = () => {
    if (bottomOptionCount > 1) {
      setCurrentBottomIndex((prev) => {
        const nextIndex = (prev - 1 + bottomOptionCount) % bottomOptionCount;
        void saveCurrentView(topOptions[currentTopIndex] ?? null, bottomOptions[nextIndex]);
        return nextIndex;
      });
    }
  };

  const handleBottomNext = () => {
    if (bottomOptionCount > 1) {
      setCurrentBottomIndex((prev) => {
        const nextIndex = (prev + 1) % bottomOptionCount;
        void saveCurrentView(topOptions[currentTopIndex] ?? null, bottomOptions[nextIndex]);
        return nextIndex;
      });
    }
  };

  // Action handlers
  const handleRandom = () => {
    let nextTopIndex = currentTopIndex;
    let nextBottomIndex = currentBottomIndex;

    if (topOptionCount > 0) {
      nextTopIndex = Math.floor(Math.random() * topOptionCount);
      setCurrentTopIndex(nextTopIndex);
    }
    if (bottomOptionCount > 0) {
      nextBottomIndex = Math.floor(Math.random() * bottomOptionCount);
      setCurrentBottomIndex(nextBottomIndex);
    }

    void saveCurrentView(topOptions[nextTopIndex] ?? null, bottomOptions[nextBottomIndex] ?? null);
  };

  const handleDescribe = () => {
    setDescribeError(null);
    setDescribeSuggestion(null);
    setDescribeModalOpen(true);
  };

  const handleDescribeSubmit = async ({
    prompt,
    includeSelectedPieces,
    includeSelectedTags,
  }: {
    prompt: string;
    includeSelectedPieces: boolean;
    includeSelectedTags: boolean;
  }) => {
    const topSelection = topOptions[currentTopIndex] ?? null;
    const bottomSelection = bottomOptions[currentBottomIndex] ?? null;

    setNanoErrorContext('describe');

    const allTags = new Set<string>();
    tops.forEach((item) => item.tags?.forEach((tag) => allTags.add(tag)));
    bottoms.forEach((item) => item.tags?.forEach((tag) => allTags.add(tag)));

    const selectionTags = new Set<string>();
    if (includeSelectedTags) {
      topSelection?.tags?.forEach((tag) => selectionTags.add(tag));
      bottomSelection?.tags?.forEach((tag) => selectionTags.add(tag));
    }

    const promptSections: string[] = [];
    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt) {
      promptSections.push(trimmedPrompt);
    }
    if (includeSelectedPieces && (topSelection || bottomSelection)) {
      const selectionSummary: string[] = [];
      if (topSelection) {
        selectionSummary.push(
          `Current top tags: ${
            topSelection.tags?.length ? topSelection.tags.join(', ') : 'none provided'
          }`,
        );
      }
      if (bottomSelection) {
        selectionSummary.push(
          `Current bottom tags: ${
            bottomSelection.tags?.length ? bottomSelection.tags.join(', ') : 'none provided'
          }`,
        );
      }
      promptSections.push(selectionSummary.join(' | '));
    }
    if (includeSelectedTags && selectionTags.size > 0) {
      promptSections.push(`Prioritize wardrobe tags: ${Array.from(selectionTags).join(', ')}`);
    }

    const finalPrompt =
      promptSections.length > 0
        ? promptSections.join('\n\n')
        : 'Suggest a complementary outfit from the items in my wardrobe.';

    setDescribeError(null);
    setDescribeSuggestion(null);

    const createLabel = (item: ClothingItem | null, fallback: string) => {
      if (!item) return fallback;
      if (item.tags && item.tags.length > 0) {
        return `${item.tags[0]} ${item.type}`;
      }
      return `${item.type} from your wardrobe`;
    };

    const sanitizeReasoning = (
      reasoning: string | undefined,
      topItem: ClothingItem | null,
      bottomItem: ClothingItem | null,
    ) => {
      if (!reasoning) return undefined;
      let sanitized = reasoning;
      if (topItem) {
        const label = createLabel(topItem, 'your top');
        const pattern = new RegExp(topItem.id, 'g');
        const quotedPattern = new RegExp(`'${topItem.id}'`, 'g');
        sanitized = sanitized.replace(quotedPattern, label).replace(pattern, label);
      }
      if (bottomItem) {
        const label = createLabel(bottomItem, 'your bottom');
        const pattern = new RegExp(bottomItem.id, 'g');
        const quotedPattern = new RegExp(`'${bottomItem.id}'`, 'g');
        sanitized = sanitized.replace(quotedPattern, label).replace(pattern, label);
      }
      return sanitized;
    };

    try {
      const result = await getSuggestion(finalPrompt, Array.from(allTags), {
        tops: tops.map((item) => ({ id: item.id, tags: item.tags || [] })),
        bottoms: bottoms.map((item) => ({ id: item.id, tags: item.tags || [] })),
      });

      const suggestedTop = tops.find((item) => item.id === result.topId) ?? null;
      const suggestedBottom = bottoms.find((item) => item.id === result.bottomId) ?? null;

      if (!suggestedTop || !suggestedBottom) {
        setDescribeError('The AI referenced items that are no longer in your wardrobe.');
        return;
      }

      setDescribeSuggestion({
        top: suggestedTop,
        bottom: suggestedBottom,
        reasoning: sanitizeReasoning(result.reasoning, suggestedTop, suggestedBottom),
      });
    } catch (error: any) {
      setDescribeError(error?.message || 'Failed to get a suggestion. Please try again.');
    }
  };

  const handleApplySuggestion = () => {
    if (!describeSuggestion) return;

    const appliedTop = describeSuggestion.top;
    const appliedBottom = describeSuggestion.bottom;

    const nextTopIndex = appliedTop
      ? topOptions.findIndex((item) => item?.id === appliedTop.id)
      : 0;
    const nextBottomIndex = appliedBottom
      ? bottomOptions.findIndex((item) => item?.id === appliedBottom.id)
      : 0;

    if (nextTopIndex >= 0) {
      setCurrentTopIndex(nextTopIndex);
    }
    if (nextBottomIndex >= 0) {
      setCurrentBottomIndex(nextBottomIndex);
    }

    void saveCurrentView(appliedTop, appliedBottom);
    setDescribeModalOpen(false);
  };

  const handleCloseDescribeModal = () => {
    if (isSuggesting) {
      return;
    }
    setDescribeModalOpen(false);
    setDescribeError(null);
    setDescribeSuggestion(null);
  };

  const handleResetDescribeSuggestion = () => {
    setDescribeSuggestion(null);
    setDescribeError(null);
  };

  const handleGenerate = async () => {
    if (!userPhotoUrl) {
      alert('Please upload your photo first!');
      return;
    }

    const topSelection = topOptions[currentTopIndex] ?? null;
    const bottomSelection = bottomOptions[currentBottomIndex] ?? null;

    if (!topSelection && !bottomSelection) {
      alert('Please select at least one clothing item!');
      return;
    }

    await backupOriginalPhoto();

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('generationPending', 'true');
      sessionStorage.removeItem('generationError');
    }
    navigate('/user-photo', { state: { pendingGeneration: true } });

    setGenerating(true);
    setNanoErrorContext('generate');

    try {
      const result = await generateTryOn(
        userPhotoUrl,
        topSelection?.image_url,
        bottomSelection?.image_url
      );

      if (result?.url) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('lastGeneratedImageUrl', result.url);
          sessionStorage.setItem(
            'lastGeneratedOutfit',
            JSON.stringify({
              topId: topSelection?.id ?? null,
              bottomId: bottomSelection?.id ?? null,
            })
          );
        }
        if (result.persisted) {
          setUserPhotoUrl(result.url);
        }
        setNanoErrorContext(null);
      } else {
        const failureMessage = nanoBanaError || 'Generation failed. Please try again.';
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('generationError', failureMessage);
        }
        if (nanoBanaError) {
          alert(`Generation failed: ${nanoBanaError}`);
        }
        setNanoErrorContext('generate');
      }
    } catch (error: any) {
      console.error('Generate error:', error);
      alert('Failed to generate try-on image');
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'generationError',
          error?.message || 'Failed to generate try-on image'
        );
      }
      setNanoErrorContext('generate');
    } finally {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('generationPending');
      }
      setGenerating(false);
    }
  };

  const selectedTop = topOptions[currentTopIndex] ?? null;
  const selectedBottom = bottomOptions[currentBottomIndex] ?? null;
  
  // Button disable logic
  const hasItems = tops.length > 0 || bottoms.length > 0;
  const hasBothTypes = tops.length > 0 && bottoms.length > 0;
  const canGenerate = hasItems && userPhotoUrl;
  const showGlobalError = Boolean(nanoBanaError) && nanoErrorContext !== 'describe';
  const describeTooltip = !hasBothTypes
    ? PLACEHOLDER_MESSAGES.UPLOAD_BOTH_ITEMS
    : isSuggesting
      ? 'Hang tight - finding an outfit idea...'
      : undefined;

  if (loading) {
    return (
      <div className="wardrobe-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="wardrobe-screen">
      <div className="window wardrobe-window">
        <div className="title-bar">
          <div className="title-bar-text">Wardrobe</div>
        </div>
        <div className="window-body wardrobe-window-body">
          {/* File Menu - top left */}
          <FileMenu className="file-menu" />

          {/* Main content area */}
          <div className="wardrobe-content">
            {/* Top clothing box */}
            <div className="clothing-section">
              <NavigationArrows
                onPrevious={handleTopPrevious}
                onNext={handleTopNext}
                disabled={topOptionCount <= 1}
                position="top"
              />
              <ClothingBox
                item={selectedTop || undefined}
                type="top"
                placeholderText="Upload your top"
              />
            </div>

            {/* Bottom clothing box */}
            <div className="clothing-section">
              <NavigationArrows
                onPrevious={handleBottomPrevious}
                onNext={handleBottomNext}
                disabled={bottomOptionCount <= 1}
                position="bottom"
              />
              <ClothingBox
                item={selectedBottom || undefined}
                type="bottom"
                placeholderText="Upload your bottom"
              />
            </div>

            {showGlobalError && (
              <p className="wardrobe-error" role="alert">
                {nanoBanaError}
              </p>
            )}

            {/* Action buttons - 2x2 grid */}
            <ActionButtons
              onRandom={handleRandom}
              onDescribe={handleDescribe}
              onGenerate={handleGenerate}
              randomDisabled={!hasItems}
              describeDisabled={!hasBothTypes || isSuggesting}
              generateDisabled={!canGenerate}
              generating={isGenerating}
              describeTooltip={describeTooltip}
            />
          </div>
        </div>
      </div>

      {/* Semi-circle navigation - right edge */}
      <SemiCircleNav
        direction="right"
        onClick={() => navigate('/user-photo')}
        className="semi-circle-right"
      />
      <DescribeModal
        isOpen={describeModalOpen}
        onClose={handleCloseDescribeModal}
        onSubmit={handleDescribeSubmit}
        isSubmitting={isSuggesting}
        error={describeError}
        suggestion={describeSuggestion}
        onApplySuggestion={handleApplySuggestion}
        onResetSuggestion={handleResetDescribeSuggestion}
        currentTop={selectedTop}
        currentBottom={selectedBottom}
      />
    </div>
  );
};

export default WardrobeScreen;
