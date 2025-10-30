// Main wardrobe screen with clothing boxes and actions
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNanoBanana } from '@/hooks/useNanoBanana';
import ClothingBox from '@/components/wardrobe/ClothingBox';
import NavigationArrows from '@/components/wardrobe/NavigationArrows';
import ActionButtons from '@/components/wardrobe/ActionButtons';
import FileMenu from '@/components/wardrobe/FileMenu';
import SemiCircleNav from '@/components/shared/SemiCircleNav';
import { ClothingItem } from '@/types';
import { supabase } from '@/lib/supabase';
import './WardrobeScreen.css';

const WardrobeScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { generateTryOn, generating: nanoBanaGenerating, error: nanoBanaError } = useNanoBanana(user?.id);

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

  // Combine loading states
  const isGenerating = generating || nanoBanaGenerating;

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
      setTops(topsData || []);

      // Load bottoms
      const { data: bottomsData, error: bottomsError } = await supabase
        .from('clothing_items')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'bottom')
        .order('created_at', { ascending: false });

      if (bottomsError) throw bottomsError;
      setBottoms(bottomsData || []);

      // Load last viewed preferences
      const { data: prefsData } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (prefsData) {
        // Find indices of last viewed items
        if (prefsData.last_viewed_top_id && topsData) {
          const topIndex = topsData.findIndex(t => t.id === prefsData.last_viewed_top_id);
          if (topIndex !== -1) setCurrentTopIndex(topIndex);
        }
        if (prefsData.last_viewed_bottom_id && bottomsData) {
          const bottomIndex = bottomsData.findIndex(b => b.id === prefsData.last_viewed_bottom_id);
          if (bottomIndex !== -1) setCurrentBottomIndex(bottomIndex);
        }
      }
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
  const saveCurrentView = async () => {
    if (!user) return;

    const currentTop = tops[currentTopIndex];
    const currentBottom = bottoms[currentBottomIndex];

    await supabase
      .from('user_preferences')
      .upsert(
        {
          user_id: user.id,
          last_viewed_top_id: currentTop?.id || null,
          last_viewed_bottom_id: currentBottom?.id || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
  };

  // Navigation handlers
  const handleTopPrevious = () => {
    if (tops.length > 1) {
      setCurrentTopIndex((prev) => (prev - 1 + tops.length) % tops.length);
      saveCurrentView();
    }
  };

  const handleTopNext = () => {
    if (tops.length > 1) {
      setCurrentTopIndex((prev) => (prev + 1) % tops.length);
      saveCurrentView();
    }
  };

  const handleBottomPrevious = () => {
    if (bottoms.length > 1) {
      setCurrentBottomIndex((prev) => (prev - 1 + bottoms.length) % bottoms.length);
      saveCurrentView();
    }
  };

  const handleBottomNext = () => {
    if (bottoms.length > 1) {
      setCurrentBottomIndex((prev) => (prev + 1) % bottoms.length);
      saveCurrentView();
    }
  };

  // Action handlers
  const handleRandom = () => {
    if (tops.length > 0) {
      setCurrentTopIndex(Math.floor(Math.random() * tops.length));
    }
    if (bottoms.length > 0) {
      setCurrentBottomIndex(Math.floor(Math.random() * bottoms.length));
    }
    saveCurrentView();
  };

  const handleDescribe = () => {
    // TODO: Implement AI describe feature
    alert('Describe feature coming soon!');
  };

  const handleGenerate = async () => {
    if (!userPhotoUrl) {
      alert('Please upload your photo first!');
      return;
    }

    const currentTop = tops[currentTopIndex];
    const currentBottom = bottoms[currentBottomIndex];

    if (!currentTop && !currentBottom) {
      alert('Please select at least one clothing item!');
      return;
    }

    await backupOriginalPhoto();

    setGenerating(true);

    try {
      const result = await generateTryOn(
        userPhotoUrl,
        currentTop?.image_url,
        currentBottom?.image_url
      );

      if (result?.url) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('lastGeneratedImageUrl', result.url);
          sessionStorage.setItem(
            'lastGeneratedOutfit',
            JSON.stringify({
              topId: currentTop?.id ?? null,
              bottomId: currentBottom?.id ?? null,
            })
          );
        }
        if (result.persisted) {
          setUserPhotoUrl(result.url);
        }
      } else if (nanoBanaError) {
        alert(`Generation failed: ${nanoBanaError}`);
      }
    } catch (error: any) {
      console.error('Generate error:', error);
      alert('Failed to generate try-on image');
    } finally {
      setGenerating(false);
    }
  };

  const currentTop = tops[currentTopIndex];
  const currentBottom = bottoms[currentBottomIndex];
  
  // Button disable logic
  const hasItems = tops.length > 0 || bottoms.length > 0;
  const hasBothTypes = tops.length > 0 && bottoms.length > 0;
  const canGenerate = hasItems && userPhotoUrl;

  if (loading) {
    return (
      <div className="wardrobe-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="wardrobe-screen">
      {/* File Menu - top left */}
      <FileMenu className="file-menu" />

      {/* Main content area */}
      <div className="wardrobe-content">
        {/* Top clothing box */}
        <div className="clothing-section">
          <NavigationArrows
            onPrevious={handleTopPrevious}
            onNext={handleTopNext}
            disabled={tops.length <= 1}
            position="top"
          />
          <ClothingBox
            item={currentTop}
            type="top"
            placeholderText="Upload your top"
          />
        </div>

        {/* Bottom clothing box */}
        <div className="clothing-section">
          <NavigationArrows
            onPrevious={handleBottomPrevious}
            onNext={handleBottomNext}
            disabled={bottoms.length <= 1}
            position="bottom"
          />
          <ClothingBox
            item={currentBottom}
            type="bottom"
            placeholderText="Upload your bottom"
          />
        </div>

        {nanoBanaError && (
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
          describeDisabled={!hasBothTypes}
          generateDisabled={!canGenerate}
          generating={isGenerating}
        />
      </div>

      {/* Semi-circle navigation - right edge */}
      <SemiCircleNav
        direction="right"
        onClick={() => navigate('/user-photo')}
        className="semi-circle-right"
      />

    </div>
  );
};

export default WardrobeScreen;
