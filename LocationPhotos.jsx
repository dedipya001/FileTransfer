// src/components/map/LocationPhotos.jsx
import React, { useState, useEffect } from "react";

const LocationPhotos = ({ location, onClose }) => {
  const [photoData, setPhotoData] = useState({
    loading: true,
    error: null,
    photos: {},
    dates: [],
    selectedDate: null
  });
  
  // Fetch photos from your backend
  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setPhotoData(prev => ({ ...prev, loading: true }));
        
        const response = await fetch(`http://localhost:5000/api/photos/location/${location.id}/by-date`);
        if (!response.ok) throw new Error('Failed to fetch photos');
        
        const data = await response.json();
        
        // Get dates in sorted order
        const dates = Object.keys(data).sort();
        
        setPhotoData({
          loading: false,
          error: null,
          photos: data,
          dates: dates,
          selectedDate: dates.length > 0 ? dates[0] : null
        });
      } catch (error) {
        console.error("Error fetching photos:", error);
        setPhotoData(prev => ({
          ...prev,
          loading: false,
          error: "Failed to load photos. Please check if the backend server is running."
        }));
      }
    };
    
    fetchPhotos();
  }, [location.id]);
  
  const handleDateChange = (date) => {
    setPhotoData(prev => ({
      ...prev,
      selectedDate: date
    }));
  };
  
  const getSelectedPhotos = () => {
    if (!photoData.selectedDate || !photoData.photos[photoData.selectedDate]) {
      return [];
    }
    return photoData.photos[photoData.selectedDate];
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="location-photos-panel">
      <div className="photos-header">
        <h2>Photos of {location.name}</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      {photoData.loading ? (
        <div className="photos-loading">
          <div className="spinner"></div>
          <p>Loading photos...</p>
        </div>
      ) : photoData.error ? (
        <div className="photos-error">
          <p>{photoData.error}</p>
          <button 
            className="retry-button"
            onClick={() => setPhotoData(prev => ({ ...prev, loading: true, error: null }))}
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="photos-content">
          <div className="date-selector">
            <h3>Select Date (April 2025)</h3>
            <div className="date-pills">
              {photoData.dates.map(date => (
                <button
                  key={date}
                  className={`date-pill ${photoData.selectedDate === date ? 'active' : ''}`}
                  onClick={() => handleDateChange(date)}
                >
                  {formatDate(date)}
                </button>
              ))}
            </div>
          </div>
          
          {photoData.dates.length === 0 ? (
            <div className="no-photos-message">
              <p>No photo dates available for this location.</p>
            </div>
          ) : (
            <div className="photos-grid">
              {getSelectedPhotos().map(photo => (
                <div className="photo-item" key={photo._id}>
                  <div className="photo-container">
                    <img src={photo.path} alt={photo.caption} />
                  </div>
                  <p className="photo-caption">{photo.caption}</p>
                </div>
              ))}
              
              {getSelectedPhotos().length === 0 && photoData.selectedDate && (
                <div className="no-photos">
                  <p>No photos found for {formatDate(photoData.selectedDate)}.</p>
                </div>
              )}
            </div>
          )}
          
          <div className="photos-footer">
            <p className="photos-info">
              Showing 5 photos per day for April 2025
            </p>
            <button 
              className="download-all-button"
              onClick={() => {
                alert('Download feature will be available in the next update.');
              }}
            >
              Download All Photos
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationPhotos;
