import React, { useState } from 'react';
import './PhotoUpload.css';

function PhotoUpload({ onPhotoUploaded }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('title', title);
    formData.append('description', description);

    try {
      const response = await fetch('http://localhost:3001/api/photos', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const newPhoto = await response.json();
        console.log('Uploaded photo:', newPhoto);
        onPhotoUploaded(newPhoto); // Make sure this line is present
        setFile(null);
        setTitle('');
        setDescription('');
      } else {
        const errorData = await response.json();
        console.error('Failed to upload photo:', errorData);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="photo-upload-form">
      <div className="form-row">
        <input
          type="file"
          id="photo-file"
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
        />
        <label htmlFor="photo-file" className="file-input-label">
          {file ? file.name : 'Choose Photo'}
        </label>
      </div>
      <div className="form-row">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="text-input"
        />
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="text-input"
        />
        <button type="submit" disabled={!file || isUploading}>
          {isUploading ? 'Uploading...' : 'Upload Photo'}
        </button>
      </div>
    </form>
  );
}

export default PhotoUpload;