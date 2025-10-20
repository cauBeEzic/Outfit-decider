// Saved outfits screen - view all saved outfit combinations
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import WiredButton from '@/components/shared/WiredButton';
import OutfitCard from '@/components/outfits/OutfitCard.tsx';
import { supabase } from '@/lib/supabase';
import { SavedOutfitWithItems } from '@/types';
import { PLACEHOLDER_MESSAGES } from '@/utils/constants';
import './SavedOutfitsScreen.css';

const SavedOutfitsScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [outfits, setOutfits] = useState<SavedOutfitWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOutfits();
  }, [user]);

  const loadOutfits = async () => {
    if (!user) return;

    try {
      // Load saved outfits with clothing items
      const { data: outfitsData, error: outfitsError } = await supabase
        .from('saved_outfits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (outfitsError) throw outfitsError;

      // For each outfit, load the clothing items and generated photos
      const outfitsWithItems = await Promise.all(
        (outfitsData || []).map(async (outfit) => {
          // Load top item
          let top = undefined;
          if (outfit.top_id) {
            const { data: topData } = await supabase
              .from('clothing_items')
              .select('*')
              .eq('id', outfit.top_id)
              .single();
            top = topData || undefined;
          }

          // Load bottom item
          let bottom = undefined;
          if (outfit.bottom_id) {
            const { data: bottomData } = await supabase
              .from('clothing_items')
              .select('*')
              .eq('id', outfit.bottom_id)
              .single();
            bottom = bottomData || undefined;
          }

          // Load generated photos
          const { data: photosData } = await supabase
            .from('generated_photos')
            .select('*')
            .eq('outfit_id', outfit.id)
            .order('created_at', { ascending: false });

          return {
            ...outfit,
            top,
            bottom,
            generated_photos: photosData || [],
          };
        })
      );

      setOutfits(outfitsWithItems);
    } catch (error) {
      console.error('Error loading outfits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOutfit = async (outfitId: string) => {
    if (!confirm('Delete this outfit?')) return;

    try {
      // Delete generated photos first
      await supabase
        .from('generated_photos')
        .delete()
        .eq('outfit_id', outfitId);

      // Delete outfit
      const { error } = await supabase
        .from('saved_outfits')
        .delete()
        .eq('id', outfitId);

      if (error) throw error;

      // Reload
      loadOutfits();
    } catch (error) {
      console.error('Error deleting outfit:', error);
      alert('Failed to delete outfit');
    }
  };

  if (loading) {
    return (
      <div className="outfits-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="saved-outfits-screen">
      <div className="outfits-content">
        <div className="outfits-header">
          <h1 className="screen-title">Saved Outfits</h1>
          <WiredButton onClick={() => navigate('/')}>
            Back
          </WiredButton>
        </div>

        {outfits.length === 0 ? (
          <div className="empty-state">
            <p>{PLACEHOLDER_MESSAGES.NO_OUTFITS}</p>
            <WiredButton onClick={() => navigate('/')}>
              Go to Wardrobe
            </WiredButton>
          </div>
        ) : (
          <div className="outfits-list">
            {outfits.map(outfit => (
              <OutfitCard
                key={outfit.id}
                outfit={outfit}
                onDelete={() => handleDeleteOutfit(outfit.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedOutfitsScreen;