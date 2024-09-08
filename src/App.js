import React, { useReducer, useEffect, useCallback, useState } from 'react';
import PhotoGallery from './components/PhotoGallery';
import PhotoUpload from './components/PhotoUpload';
import PhotoModal from './components/PhotoModal';
import './App.css';

function photoReducer(state, action) {
  switch (action.type) {
    case 'SET_PHOTOS':
      return action.payload;
    case 'ADD_PHOTO':
      return [action.payload, ...state]; // Add new photo to the beginning of the array
    case 'DELETE_PHOTO':
      return state.filter(photo => photo._id !== action.payload);
    default:
      return state;
  }
}

function App() {
  const [photos, dispatch] = useReducer(photoReducer, []);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    console.log('Photos state updated:', photos);
  }, [photos]);

  const fetchPhotos = async () => {
    console.log('Fetching photos...');
    try {
      const response = await fetch('http://localhost:3001/api/photos');
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched photos:', data);
        dispatch({ type: 'SET_PHOTOS', payload: data });
      } else {
        console.error('Failed to fetch photos');
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  const handleDeletePhoto = useCallback(async (photoId) => {
    console.log('Deleting photo:', photoId);
    try {
      const response = await fetch(`http://localhost:3001/api/photos/${photoId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('Photo deleted successfully:', photoId);
        dispatch({ type: 'DELETE_PHOTO', payload: photoId });
        if (selectedPhoto && selectedPhoto._id === photoId) {
          setSelectedPhoto(null);
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to delete photo:', errorData.message);
        // Optionally, you can show an error message to the user here
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      // Optionally, you can show an error message to the user here
    }
  }, [selectedPhoto]);

  const handlePhotoUploaded = useCallback((newPhoto) => {
    console.log('New photo uploaded:', newPhoto);
    dispatch({ type: 'ADD_PHOTO', payload: newPhoto });
  }, []);

  const handlePhotoSelect = (photo) => {
    setSelectedPhoto(photo);
  };

  const handleCloseModal = () => {
    setSelectedPhoto(null);
  };

  const handleFeedbackSubmitted = (updatedPhoto) => {
    dispatch({ type: 'SET_PHOTOS', payload: photos.map(photo => 
      photo._id === updatedPhoto._id ? updatedPhoto : photo
    )});
    setSelectedPhoto(updatedPhoto);
  };

  return (
    <div className="App">
      <h1>Photo for Critique</h1>
      <PhotoUpload onPhotoUploaded={handlePhotoUploaded} />
      <PhotoGallery 
        photos={photos} 
        onPhotoSelect={handlePhotoSelect} 
        onDeletePhoto={handleDeletePhoto}
      />
      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={handleCloseModal}
          onSubmitFeedback={handleFeedbackSubmitted}
        />
      )}
    </div>
  );
}

export default App;
