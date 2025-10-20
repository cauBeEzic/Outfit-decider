// Polaroid-style clothing card component
import React, { useState } from 'react';
import { ClothingItem } from '@/types';
import { supabase, getStoragePath } from '@/lib/supabase';
import { STORAGE_BUCKETS } from '@/utils/constants';
import './ClothingCard.css';

interface ClothingCardProps {
  item: ClothingItem;
  onDelete?: () => void;
}

const ClothingCard: React.FC<ClothingCardProps> = ({ item, onDelete }) => {
  const [showAllTags, setShowAllTags] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const displayedTags = showAllTags ? item.tags : item.tags.slice(0, 3);
  const remainingCount = item.tags.length - 3;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    setDeleting(true);
    try {
      // Delete from storage
      const filePath = item.image_url.split('/').pop()?.split('?')[0];
      if (filePath) {
        await supabase.storage
          .from(STORAGE_BUCKETS.CLOTHING_ITEMS)
          .remove([`${item.user_id}/${filePath}`]);
      }

      // Delete from database
      const { error } = await supabase
        .from('clothing_items')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      if (onDelete) onDelete();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="clothing-card-container">
      <div className="polaroid-card">
        <div className="polaroid-image-container">
          <img src={item.image_url} alt={item.type} className="polaroid-image" />
        </div>
        <div className="polaroid-tags">
          {displayedTags.map((tag, index) => (
            <span key={index} className="tag-badge">
              {tag}
            </span>
          ))}
          {!showAllTags && remainingCount > 0 && (
            <button
              className="more-tags-btn"
              onClick={() => setShowAllTags(true)}
            >
              +{remainingCount} more
            </button>
          )}
        </div>
      </div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="delete-item-btn"
        aria-label="Delete item"
      >
        {deleting ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  );
};

export default ClothingCard;