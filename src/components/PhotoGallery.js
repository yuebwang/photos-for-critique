import React, { useState, useCallback } from 'react';
import './PhotoGallery.css';

function PhotoGallery({ photos, onPhotoSelect, onDeletePhoto }) {
  const [deletingPhotoIds, setDeletingPhotoIds] = useState(new Set());

  const handleDelete = useCallback(async (e, photoId) => {
    e.stopPropagation(); // Prevent opening the modal when clicking delete
    if (window.confirm('Are you sure you want to delete this photo?')) {
      console.log('Confirming deletion of photo:', photoId);
      setDeletingPhotoIds(prev => new Set(prev).add(photoId));
      await onDeletePhoto(photoId);
      setDeletingPhotoIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(photoId);
        return newSet;
      });
    }
  }, [onDeletePhoto]);

  console.log('Rendering PhotoGallery, photos:', photos);
  console.log('Deleting photo IDs:', Array.from(deletingPhotoIds));

  if (!photos || photos.length === 0) {
    return <div>No photos available</div>;
  }

  return (
    <div className="photo-gallery">
      {photos.map((photo) => {
        if (deletingPhotoIds.has(photo._id)) {
          console.log('Skipping deleted photo:', photo._id);
          return null;
        }
        return (
          <div key={photo._id} className="photo-card">
            <img 
              src={`http://localhost:3001/uploads/${photo.filename}`} 
              alt={photo.title} 
              onClick={() => onPhotoSelect(photo)}
              onError={(e) => {
                console.error(`Error loading image: ${e.target.src}`);
                e.target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Found';
              }}
            />
            <div className="photo-info">
              <h3>{photo.title}</h3>
              <p>{photo.description}</p>
            </div>
            <button 
              className="delete-button" 
              onClick={(e) => handleDelete(e, photo._id)}
              aria-label="Delete photo"
            >
              <span>🗑️</span>
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default React.memo(PhotoGallery);