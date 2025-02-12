import React, { useState } from 'react';
import axios from 'axios';
import './style.css';

const ImageUpload = () => {
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const sampleImages = [
    'https://th.bing.com/th/id/OIP.Qxagv3ceIsv4l6KjkSTz4wHaFN?w=207&h=180&c=7&r=0&o=5&dpr=1.3&pid=1.7',
    'https://th.bing.com/th?q=Tennis&w=120&h=120&c=1&rs=1&qlt=90&cb=1&dpr=1.3&pid=InlineBlock&mkt=en-IN&cc=IN&setlang=en&adlt=moderate&t=1&mw=247',
    'https://th.bing.com/th/id/OIP.REeJ8K0gDQpYTCKTMZj9sAHaE2?w=290&h=190&c=7&r=0&o=5&dpr=1.3&pid=1.7'
  ];

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files[0];
    const imageUrlFromDrag = event.dataTransfer.getData('text/plain');

    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
      setImageFile(file);
    } else if (imageUrlFromDrag) {
      try {
        const response = await fetch(imageUrlFromDrag);
        const blob = await response.blob();
        const file = new File([blob], 'sample-image.png', { type: 'image/png' });
        const imageObjectURL = URL.createObjectURL(file);
        setImage(imageObjectURL);
        setImageFile(file);
      } catch (error) {
        console.error('Error processing sample image:', error);
      }
    } else {
      alert('Please drop an image file.');
    }
  };

  const handleUpload = async () => {
    if (!imageFile) {
      alert('Please drop an image first!');
      return;
    }

    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadStatus('Upload Successful! File Path: ' + response.data.filePath);
    } catch (error) {
      console.error(error);
      setUploadStatus('Upload Failed.');
    }
  };

  const handleSampleImageDrop = (imageUrl) => {
    fetch(imageUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "sample-image.png", { type: "image/png" });
        setImage(imageUrl);
        setImageFile(file);
      });
  };

  return (
    <div className="image-upload-container">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`drop-zone ${dragActive ? 'drop-zone-active' : ''}`}
      >
        {image ? (
          <img src={image} alt="Dropped" />
        ) : (
          <p style={{ backgroundColor: 'transparent' }}>Drag & Drop an image here</p>
        )}
      </div>

      {image && (
        <button onClick={handleUpload} className="upload-button">
          Upload Image
        </button>
      )}

      {uploadStatus && <p className="upload-status">{uploadStatus}</p>}

      <div className="sample-images-container">
        <h3>Sample Images</h3>
        <div className="sample-images-grid">
          {sampleImages.map((imgUrl, index) => (
            <img
              key={index}
              src={imgUrl}
              alt={`Sample ${index + 1}`}
              draggable="true"
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', imgUrl);
              }}
              onClick={() => handleSampleImageDrop(imgUrl)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;