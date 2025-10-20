// Storage screen - view all clothing items with filters
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import WiredButton from '@/components/shared/WiredButton';
import ClothingCard from '@/components/storage/ClothingCard';
import FilterTags from '@/components/storage/FilterTags';
import { supabase } from '@/lib/supabase';
import { ClothingItem } from '@/types';
import { PLACEHOLDER_MESSAGES } from '@/utils/constants';
import './StorageScreen.css';

const StorageScreen: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<ClothingItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ClothingItem[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, [user]);

  useEffect(() => {
    // Filter items when selected tags change
    if (selectedTags.length === 0) {
      setFilteredItems(items);
    } else {
      const filtered = items.filter(item =>
        selectedTags.every(tag => item.tags.includes(tag))
      );
      setFilteredItems(filtered);
    }
  }, [selectedTags, items]);

  const loadItems = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('clothing_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setItems(data || []);
      setFilteredItems(data || []);

      // Extract all unique tags
      const tagsSet = new Set<string>();
      data?.forEach(item => {
        item.tags.forEach((tag: string) => tagsSet.add(tag));
      });
      setAllTags(Array.from(tagsSet).sort());
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSelectedTags([]);
  };

  if (loading) {
    return (
      <div className="storage-loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className="storage-screen">
      <div className="storage-content">
        <div className="storage-header">
          <h1 className="screen-title">Storage</h1>
          <WiredButton onClick={() => navigate('/')}>
            Back
          </WiredButton>
        </div>

        {/* Filter section */}
        {allTags.length > 0 && (
          <div className="filter-section">
            <div className="filter-header">
              <h3>Filter by tags:</h3>
              {selectedTags.length > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="clear-filters-btn"
                >
                  Clear filters
                </button>
              )}
            </div>
            <FilterTags
              allTags={allTags}
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
            />
          </div>
        )}

        {/* Items grid */}
        {filteredItems.length === 0 ? (
          <div className="empty-state">
            <p>{items.length === 0 ? PLACEHOLDER_MESSAGES.NO_ITEMS : 'No items match the selected filters'}</p>
            {items.length === 0 && (
              <WiredButton onClick={() => navigate('/upload/top')}>
                Upload First Item
              </WiredButton>
            )}
          </div>
        ) : (
          <div className="items-grid">
            {filteredItems.map(item => (
              <ClothingCard
                key={item.id}
                item={item}
                onDelete={loadItems}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StorageScreen;