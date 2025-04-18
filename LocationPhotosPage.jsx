// src/pages/LocationPhotosPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../styles/locationPhotosPage.css';

const MARKER_COLORS = {
  "historic": "#FF9800",
  "religious": "#FFC107",
  "educational": "#3F51B5",
  "commercial": "#9C27B0",
  "recreation": "#4CAF50",
  "transport": "#F44336",
  "infrastructure": "#2196F3",
  "government": "#795548",
  "market": "#FF5722",
  "hospital": "#E91E63",
  "library": "#673AB7",
};

const LocationPhotosPage = () => {
  const { locationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [photoData, setPhotoData] = useState({
    photos: {},
    dates: [],
    selectedDate: null
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [garbageAnalysis, setGarbageAnalysis] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch location details
        const locationResponse = await fetch(`http://localhost:5000/api/locations/${locationId}`);
        if (!locationResponse.ok) throw new Error('Failed to fetch location data');
        const locationData = await locationResponse.json();
        setLocation(locationData);
        
        // Fetch photos
        const photosResponse = await fetch(`http://localhost:5000/api/photos/location/${locationId}/by-date`);
        if (!photosResponse.ok) throw new Error('Failed to fetch photos');
        const photosData = await photosResponse.json();
        
        // Get dates in sorted order
        const dates = Object.keys(photosData).sort();
        setPhotoData({
          photos: photosData,
          dates: dates,
          selectedDate: dates.length > 0 ? dates[0] : null
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [locationId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    }).format(date);
  };

  const handleDateChange = (date) => {
    setPhotoData(prev => ({
      ...prev,
      selectedDate: date
    }));
    setSelectedImage(null);
    setGarbageAnalysis(null);
  };

  const handleImageSelect = (photo) => {
    setSelectedImage(photo);
    
    // Simulate ML model analysis (in production, fetch from backend)
    const mockAnalysis = {
      wastePercentage: (Math.random() * 25).toFixed(2),
      scene_width_m: (10 + Math.random() * 5).toFixed(1),
      scene_height_m: (5 + Math.random() * 3).toFixed(1),
      scene_area_m2: (50 + Math.random() * 30).toFixed(1),
      waste_area_m2: (Math.random() * 15).toFixed(2),
      capture_distance_m: (5 + Math.random() * 5).toFixed(1),
      waste_pixels: Math.floor(Math.random() * 50000) + 10000,
      total_pixels: 800 * 600,
      detections: Math.floor(Math.random() * 8) + 1,
      recommended_action: ['Immediate cleanup required', 'Schedule regular pickup', 'Monitor for changes', 'No action needed'][Math.floor(Math.random() * 4)],
      severity: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
    };
    
    setGarbageAnalysis(mockAnalysis);
  };

  const getSelectedDatePhotos = () => {
    if (!photoData.selectedDate || !photoData.photos[photoData.selectedDate]) {
      return [];
    }
    return photoData.photos[photoData.selectedDate];
  };

  const getPhotoUrl = (path) => {
    // Assuming the paths are relative to your backend server
    return `http://localhost:5000${path}`;
  };

  if (loading) {
    return (
      <div className="location-photos-page loading-container">
        <div className="spinner"></div>
        <h2>Loading photos...</h2>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="location-photos-page error-container">
        <h2>Error Loading Photos</h2>
        <p>{error || "Location not found"}</p>
        <Link to="/map" className="back-button">Return to Map</Link>
      </div>
    );
  }

  return (
    <div className="location-photos-page">
      <header className="photos-page-header" style={{ backgroundColor: MARKER_COLORS[location.category] }}>
        <div className="header-content">
          <h1>{location.name} - Photos</h1>
          <div className="location-meta">
            <span className="category-badge">{location.category}</span>
            <span className="coordinates">
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </span>
          </div>
        </div>
        <Link to="/map" className="back-to-map">
          <span className="back-icon">←</span>
          Back to Map
        </Link>
      </header>
      
      <div className="photos-content">
        <div className="calendar-sidebar">
          <h2>April 2025</h2>
          <div className="date-list">
            {photoData.dates.map(date => (
              <button
                key={date}
                className={`date-button ${photoData.selectedDate === date ? 'active' : ''}`}
                onClick={() => handleDateChange(date)}
                style={{ 
                  borderColor: photoData.selectedDate === date ? MARKER_COLORS[location.category] : 'transparent',
                  backgroundColor: photoData.selectedDate === date ? `${MARKER_COLORS[location.category]}20` : 'transparent'
                }}
              >
                {formatDate(date)}
                <span className="photo-count">{photoData.photos[date]?.length || 0} photos</span>
              </button>
            ))}
          </div>
          
          <div className="sidebar-actions">
            <Link to={`/location/${locationId}/stats`} className="sidebar-action-button">
              <span className="action-icon">📊</span>
              View Statistics
            </Link>
          </div>
        </div>
        
        <div className="photos-main-content">
          <div className="selected-date-header">
            <h2>{photoData.selectedDate ? formatDate(photoData.selectedDate) : 'No date selected'}</h2>
            <span className="photos-count">{getSelectedDatePhotos().length} photos</span>
          </div>
          
          {photoData.selectedDate && (
            <div className="photos-grid">
              {getSelectedDatePhotos().length > 0 ? (
                getSelectedDatePhotos().map(photo => (
                  <div 
                    key={photo._id} 
                    className={`photo-card ${selectedImage?._id === photo._id ? 'selected' : ''}`}
                    onClick={() => handleImageSelect(photo)}
                  >
                    <div className="photo-thumbnail">
                      <img 
                        src={getPhotoUrl(photo.path)} 
                        alt={photo.caption || `Photo from ${formatDate(photoData.selectedDate)}`} 
                      />
                    </div>
                    <div className="photo-info">
                      <span className="photo-time">
                        {new Date(photo.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-photos-message">
                  <p>No photos available for this date</p>
                </div>
              )}
            </div>
          )}
          
          {selectedImage && (
            <div className="selected-photo-details">
              <div className="photo-detail-header">
                <h3>Photo Details</h3>
                <button className="close-detail" onClick={() => setSelectedImage(null)}>×</button>
              </div>
              
              <div className="photo-detail-content">
                <div className="photo-large">
                  <img 
                    src={getPhotoUrl(selectedImage.path)} 
                    alt={selectedImage.caption || `Photo from ${formatDate(photoData.selectedDate)}`} 
                  />
                </div>
                
                <div className="photo-metadata">
                  <div className="metadata-section">
                    <h4>Photo Information</h4>
                    <div className="metadata-grid">
                      <div className="metadata-item">
                        <span className="metadata-label">Date:</span>
                        <span className="metadata-value">{formatDate(selectedImage.date)}</span>
                      </div>
                      <div className="metadata-item">
                        <span className="metadata-label">Time:</span>
                        <span className="metadata-value">
                          {new Date(selectedImage.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="metadata-item">
                        <span className="metadata-label">Dimensions:</span>
                        <span className="metadata-value">
                          {selectedImage.metadata?.width || 800} × {selectedImage.metadata?.height || 600}
                        </span>
                      </div>
                      <div className="metadata-item">
                        <span className="metadata-label">File Size:</span>
                        <span className="metadata-value">
                          {selectedImage.metadata?.size 
                            ? `${(selectedImage.metadata.size / 1024).toFixed(1)} KB` 
                            : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {garbageAnalysis && (
                    <div className="metadata-section">
                      <h4>Garbage Analysis (YOLOv8)</h4>
                      <div className="metadata-grid">
                        <div className="metadata-item">
                          <span className="metadata-label">Waste Coverage:</span>
                          <span className="metadata-value highlight">{garbageAnalysis.wastePercentage}%</span>
                        </div>
                        <div className="metadata-item">
                          <span className="metadata-label">Waste Area:</span>
                          <span className="metadata-value">{garbageAnalysis.waste_area_m2} m²</span>
                        </div>
                        <div className="metadata-item">
                          <span className="metadata-label">Scene Area:</span>
                          <span className="metadata-value">{garbageAnalysis.scene_area_m2} m²</span>
                        </div>
                        <div className="metadata-item">
                          <span className="metadata-label">Detections:</span>
                          <span className="metadata-value">{garbageAnalysis.detections}</span>
                        </div>
                        <div className="metadata-item">
                          <span className="metadata-label">Severity:</span>
                          <span className={`metadata-value severity-${garbageAnalysis.severity.toLowerCase()}`}>
                            {garbageAnalysis.severity}
                          </span>
                        </div>
                        <div className="metadata-item full-width">
                          <span className="metadata-label">Recommendation:</span>
                          <span className="metadata-value">{garbageAnalysis.recommended_action}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="photo-actions">
                    <button className="photo-action-button analyze" onClick={() => handleImageSelect(selectedImage)}>
                      <span className="action-icon">🔍</span>
                      Analyze Waste
                    </button>
                    <button className="photo-action-button download" onClick={() => window.open(getPhotoUrl(selectedImage.path), '_blank')}>
                      <span className="action-icon">💾</span>
                      Download
                    </button>
                    <button className="photo-action-button report" onClick={() => alert('Report feature will be available in the next update')}>
                      <span className="action-icon">⚠️</span>
                      Report Issue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationPhotosPage;
