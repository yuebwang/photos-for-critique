import React, { useState, useCallback, useEffect, useRef } from 'react';
import './PhotoModal.css';

function PhotoModal({ photo, onClose, onSubmitFeedback, onDeletePhoto }) {
  const [feedback, setFeedback] = useState('');
  const [localPhoto, setLocalPhoto] = useState(photo);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const modalInfoContentRef = useRef(null);
  const feedbackListRef = useRef(null);

  useEffect(() => {
    setLocalPhoto(photo);
  }, [photo]);

  useEffect(() => {
    if (feedbackListRef.current && modalInfoContentRef.current && localPhoto.feedback && localPhoto.feedback.length > 0) {
      setTimeout(() => {
        const feedbackItems = feedbackListRef.current.querySelectorAll('li');
        if (feedbackItems.length > 0) {
          const lastFeedbackItem = feedbackItems[feedbackItems.length - 1];
          lastFeedbackItem.scrollIntoView({ behavior: 'smooth', block: 'start' });
          
          modalInfoContentRef.current.scrollTop += 60;
        }
      }, 100);
    }
  }, [localPhoto.feedback]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!feedback.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:3001/api/photos/${localPhoto._id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: feedback }),
      });

      console.log('Feedback submission response status:', response.status);

      if (response.ok) {
        const updatedPhoto = await response.json();
        console.log('Updated photo after feedback submission:', updatedPhoto);
        setLocalPhoto(updatedPhoto);
        setFeedback('');
        if (onSubmitFeedback) {
          onSubmitFeedback(updatedPhoto);
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to submit feedback:', errorData);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [feedback, localPhoto, onSubmitFeedback]);

  const handleDelete = useCallback(() => {
    setShowDeleteConfirmation(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/photos/${photo._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onDeletePhoto(photo._id);
        onClose();
      } else {
        console.error('Failed to delete photo');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  }, [photo._id, onDeletePhoto, onClose]);

  const cancelDelete = useCallback(() => {
    setShowDeleteConfirmation(false);
  }, []);

  if (!localPhoto) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-image-container">
          <img src={`http://localhost:3001/uploads/${localPhoto.filename}`} alt={localPhoto.title} />
        </div>
        <div className="modal-info">
          <h2 className="modal-title">{localPhoto.title}</h2>
          <div className="modal-info-content" ref={modalInfoContentRef}>
            <p className="photo-description">{localPhoto.description}</p>
            
            <div className="feedback-list" ref={feedbackListRef}>
              {localPhoto.feedback && localPhoto.feedback.length > 0 ? (
                <ul>
                  {localPhoto.feedback.map((item, index) => (
                    <li key={item._id || index}>
                      <div className="feedback-item">
                        <div className="feedback-text">{item.text}</div>
                        <div className="feedback-meta">
                          {new Date(item.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No feedback yet.</p>
              )}
            </div>
          </div>
          <div className="feedback-form">
            <form onSubmit={handleSubmit}>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Leave your feedback here..."
              />
              <button type="submit" disabled={isSubmitting || !feedback.trim()}>
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
          </div>
        </div>
        <div className="modal-actions">
          <button onClick={handleDelete} className="delete-button">Delete Photo</button>
        </div>

        {showDeleteConfirmation && (
          <div className="delete-confirmation">
            <p>Are you sure you want to delete this photo?</p>
            <button onClick={confirmDelete}>Yes, delete</button>
            <button onClick={cancelDelete}>Cancel</button>
          </div>
        )}

        <button className="close-button" onClick={onClose}>&times;</button>
      </div>
    </div>
  );
}

export default PhotoModal;
