// Main wardrobe screen with clothing boxes and actions
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ClothingBox from '@/components/wardrobe/ClothingBox';
import NavigationArrows from '@/components/wardrobe/NavigationArrows.tsx';
import ActionButtons from '@/components/wardrobe/ActionButton';
import FileMenu from '@/components/wardrobe/FileMenu.tsx';
import SemiCircleNav from '@/components/shared/SemiCircleNav';
import { ClothingItem } from '@/types';
import { supabase } from '@/lib/supabase';
import './WardrobeScreen.css';

const WardrobeScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for clothing items
  const [tops, setTops] = useState<ClothingItem[]>([]);
  const [bottoms, setBottoms] = useState<ClothingItem[]>([]);
  const [currentTopIndex, setCurrentTopIndex] = useState(0);
  const [currentBottomIndex, setCurrentBottomIndex] = useState(0);
  
  // State for user photo and generated image
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

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

  // Save current view state
  const saveCurrentView = async () => {
    if (!user) return;

    const currentTop = tops[currentTopIndex];
    const currentBottom = bottoms[currentBottomIndex];

    await supabase
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        last_viewed_top_id: currentTop?.id || null,
        last_viewed_bottom_id: currentBottom?.id || null,
        updated_at: new Date().toISOString(),
      });
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

  const handleGenerate = () => {
    // TODO: Implement Nano Banana generation
    setGenerating(true);
    setTimeout(() => {
      alert('Generate feature coming soon!');
      setGenerating(false);
    }, 1000);
  };

  const handleSaveRating = () => {
    // TODO: Implement save/rating modal
    alert('Save/Rating feature coming soon!');
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
            generatedImageUrl={generatedImageUrl}
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
            generatedImageUrl={null}
          />
        </div>

        {/* Action buttons - 2x2 grid */}
        <ActionButtons
          onRandom={handleRandom}
          onDescribe={handleDescribe}
          onGenerate={handleGenerate}
          onSaveRating={handleSaveRating}
          randomDisabled={!hasItems}
          describeDisabled={!hasBothTypes}
          generateDisabled={!canGenerate}
          saveRatingDisabled={!generatedImageUrl}
          generating={generating}
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