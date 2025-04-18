import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Map, { Source, Layer, Marker, Popup, NavigationControl, GeolocateControl } from 'react-map-gl';
import { useToast } from '../../context/ToastContext';
import { useSettings } from '../../context/SettingsContext';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../../styles/vijayawadaStyles.css';

// Import components
import SearchBar from './SearchBar';
import MapInfo from './MapInfo';
import LoadingOverlay from './LoadingOverlay';
import GarbageMonitor from './GarbageMonitor';
import Attribution from '../common/Attribution';


const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Vijayawada coordinates and default viewport
const VIJAYAWADA_CENTER = {
  longitude: 80.6480,
  latitude: 16.5062
};

const DEFAULT_VIEWPORT = {
  ...VIJAYAWADA_CENTER,
  zoom: 12,
  pitch: 0,
  bearing: 0,
};

// Categories for landmarks
const CATEGORIES = {
  HISTORIC: 'historic',
  RELIGIOUS: 'religious',
  EDUCATIONAL: 'educational',
  COMMERCIAL: 'commercial',
  RECREATION: 'recreation',
  TRANSPORT: 'transport',
  INFRASTRUCTURE: 'infrastructure',
  GOVERNMENT: 'government',
  GARBAGE: 'garbage',
  MARKET: 'market',
  HOSPITAL: 'hospital',
  LIBRARY: 'library'
};

// Vijayawada city boundary GeoJSON
const VIJAYAWADA_BOUNDARY = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [[
      [80.5642, 16.4724],
      [80.6063, 16.4510],
      [80.6392, 16.4474],
      [80.6842, 16.4655],
      [80.7142, 16.4910],
      [80.7249, 16.5210],
      [80.7302, 16.5510],
      [80.7232, 16.5824],
      [80.6956, 16.6237],
      [80.6556, 16.6383],
      [80.6063, 16.6324],
      [80.5642, 16.6037],
      [80.5570, 16.5724],
      [80.5570, 16.5210],
      [80.5642, 16.4724]
    ]]
  }
};

// Garbage collection points with status
const GARBAGE_COLLECTION_POINTS = [
  {
    id: 'gc1',
    name: 'Benz Circle Collection Point',
    category: CATEGORIES.GARBAGE,
    status: 'critical', // Options: normal, attention, critical
    fillLevel: 85,  // percentage full
    lastCollected: '2025-03-20T08:30:00',
    latitude: 16.5060,
    longitude: 80.6420,
    address: 'Benz Circle, MG Road, Vijayawada'
  },
  {
    id: 'gc2',
    name: 'Railway Station Waste Facility',
    category: CATEGORIES.GARBAGE,
    status: 'normal',
    fillLevel: 40,
    lastCollected: '2025-03-21T07:15:00',
    latitude: 16.5190,
    longitude: 80.6250,
    address: 'Near Platform 1, Vijayawada Railway Station'
  },
  {
    id: 'gc3',
    name: 'Governorpet Collection Center',
    category: CATEGORIES.GARBAGE,
    status: 'attention',
    fillLevel: 70,
    lastCollected: '2025-03-20T16:00:00',
    latitude: 16.5079,
    longitude: 80.6315,
    address: 'Governorpet Main Road, Vijayawada'
  },
  {
    id: 'gc4',
    name: 'Autonagar Waste Management',
    category: CATEGORIES.GARBAGE,
    status: 'normal',
    fillLevel: 35,
    lastCollected: '2025-03-21T06:45:00',
    latitude: 16.4890,
    longitude: 80.6750,
    address: 'Autonagar Industrial Area, Vijayawada'
  },
  {
    id: 'gc5',
    name: 'Ajit Singh Nagar Recycling Center',
    category: CATEGORIES.GARBAGE,
    status: 'attention',
    fillLevel: 65,
    lastCollected: '2025-03-20T17:30:00',
    latitude: 16.5232,
    longitude: 80.6650,
    address: 'Ajit Singh Nagar, Vijayawada'
  },
  {
    id: 'gc6',
    name: 'Gunadala Collection Point',
    category: CATEGORIES.GARBAGE,
    status: 'critical',
    fillLevel: 90,
    lastCollected: '2025-03-20T09:00:00',
    latitude: 16.5298,
    longitude: 80.6420,
    address: 'Near Gunadala Matha Church, Vijayawada'
  },
  {
    id: 'gc7',
    name: 'Machavaram Collection Center',
    category: CATEGORIES.GARBAGE,
    status: 'normal',
    fillLevel: 28,
    lastCollected: '2025-03-21T08:00:00',
    latitude: 16.5170,
    longitude: 80.6550,
    address: 'Machavaram Down, Vijayawada'
  },
  {
    id: 'gc8',
    name: 'Patamata Collection Facility',
    category: CATEGORIES.GARBAGE,
    status: 'normal',
    fillLevel: 55,
    lastCollected: '2025-03-21T07:30:00',
    latitude: 16.4930,
    longitude: 80.6600,
    address: 'Patamata Main Road, Vijayawada'
  }
];

// Major landmarks in Vijayawada with coordinates
const VIJAYAWADA_LANDMARKS = [
  {
    id: 1,
    name: "Kanaka Durga Temple",
    category: CATEGORIES.RELIGIOUS,
    description: "Famous temple dedicated to Goddess Durga located on Indrakeeladri hill. One of the most important religious sites in Andhra Pradesh.",
    latitude: 16.5175,
    longitude: 80.6096,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Sri_Durga_Malleswara_Swamy_Varla_Devasthanam.jpg/320px-Sri_Durga_Malleswara_Swamy_Varla_Devasthanam.jpg"
  },
  {
    id: 2,
    name: "Prakasam Barrage",
    category: CATEGORIES.INFRASTRUCTURE,
    description: "Major dam across Krishna River connecting Vijayawada with Guntur district. Built in 1957, it serves irrigation needs and is a popular tourist spot.",
    latitude: 16.5061,
    longitude: 80.6080,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Prakasam_Barrage_evening.jpg/320px-Prakasam_Barrage_evening.jpg"
  },
  {
    id: 3,
    name: "Vijayawada Railway Station",
    category: CATEGORIES.TRANSPORT,
    description: "One of the busiest railway stations in India with over 1.4 million passengers daily. A key junction connecting North and South India.",
    latitude: 16.5175,
    longitude: 80.6236,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Vijayawada_Junction_railway_station_board.jpg/320px-Vijayawada_Junction_railway_station_board.jpg"
  },
  {
    id: 4,
    name: "Rajiv Gandhi Park",
    category: CATEGORIES.RECREATION,
    description: "Major urban park in the heart of the city with lush greenery, walking paths, and recreational facilities for families.",
    latitude: 16.5009,
    longitude: 80.6525,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Rajiv_Gandhi_Park%2C_Vijayawada.jpg/320px-Rajiv_Gandhi_Park%2C_Vijayawada.jpg"
  },
  {
    id: 5,
    name: "Mangalagiri Market Area",
    category: CATEGORIES.MARKET,
    description: "A bustling market area known for textiles, fresh produce, spices, and local handicrafts. Popular among locals and tourists alike.",
    latitude: 16.4300,
    longitude: 80.5580,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/MG_Road%2C_Vijayawada.jpg/320px-MG_Road%2C_Vijayawada.jpg"
  },
  {
    id: 6,
    name: "SRM University, AP",
    category: CATEGORIES.EDUCATIONAL,
    description: "A prominent private university offering undergraduate, postgraduate, and doctoral programs in engineering, sciences, liberal arts, and management.",
    latitude: 16.4807,
    longitude: 80.5010,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/SRM_University%2C_Andhra_Pradesh.jpg/320px-SRM_University%2C_Andhra_Pradesh.jpg"
  }
];

// Map marker colors based on landmark category
const MARKER_COLORS = {
  [CATEGORIES.HISTORIC]: "#FF9800",      // Orange
  [CATEGORIES.RELIGIOUS]: "#FFC107",     // Amber
  [CATEGORIES.EDUCATIONAL]: "#3F51B5",   // Indigo
  [CATEGORIES.COMMERCIAL]: "#9C27B0",    // Purple
  [CATEGORIES.RECREATION]: "#4CAF50",    // Green
  [CATEGORIES.TRANSPORT]: "#F44336",     // Red
  [CATEGORIES.INFRASTRUCTURE]: "#2196F3", // Blue
  [CATEGORIES.GOVERNMENT]: "#795548",    // Brown
  [CATEGORIES.MARKET]: "#FF5722",        // Deep Orange
  [CATEGORIES.HOSPITAL]: "#E91E63",      // Pink
  [CATEGORIES.LIBRARY]: "#673AB7",       // Deep Purple
};

// Garbage marker colors based on status
const GARBAGE_STATUS_COLORS = {
  normal: "#4CAF50",      // Green
  attention: "#FF9800",   // Orange
  critical: "#F44336",    // Red
};

const ElectoralMap = () => {
  const navigate = useNavigate(); // Add this hook for navigation
  const { addToast } = useToast();
  const { mapSettings } = useSettings();
  const mapRef = useRef();
  
  const [viewport, setViewport] = useState(DEFAULT_VIEWPORT);
  const [selectedLandmark, setSelectedLandmark] = useState(null);
  const [selectedGarbage, setSelectedGarbage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLegend, setShowLegend] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [showGarbageMonitor, setShowGarbageMonitor] = useState(false);
  const [garbageStats, setGarbageStats] = useState({
    total: GARBAGE_COLLECTION_POINTS.length,
    normal: GARBAGE_COLLECTION_POINTS.filter(point => point.status === 'normal').length,
    attention: GARBAGE_COLLECTION_POINTS.filter(point => point.status === 'attention').length,
    critical: GARBAGE_COLLECTION_POINTS.filter(point => point.status === 'critical').length,
    averageFillLevel: Math.round(GARBAGE_COLLECTION_POINTS.reduce((sum, point) => sum + point.fillLevel, 0) / GARBAGE_COLLECTION_POINTS.length)
  });

  // Filter landmarks by active category
  const filteredLandmarks = activeCategory 
    ? VIJAYAWADA_LANDMARKS.filter(landmark => landmark.category === activeCategory)
    : VIJAYAWADA_LANDMARKS;

  // Show initial notification
  useEffect(() => {
    addToast(
      'Welcome to the Vijayawada City Map! Click on landmarks to explore.',
      'info',
      5000,
      { once: true, id: 'vijayawada-welcome' }
    );
  }, [addToast]);

  // Handle search for locations within Vijayawada
  const handleSearch = async (placeName) => {
    setError(null);
    
    if (!placeName) {
      setError("Please enter a location to search");
      return;
    }
    
    try {
      setLoading(true);
      
      // Format search query to focus on Vijayawada
      const searchQuery = `${placeName}, Vijayawada, Andhra Pradesh`;
      
      // Search Mapbox geocoding API
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?proximity=${VIJAYAWADA_CENTER.longitude},${VIJAYAWADA_CENTER.latitude}&bbox=80.56,16.47,80.73,16.64&access_token=${MAPBOX_TOKEN}`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch location data");
      }
      
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        const location = data.features[0];
        
        // Check if the result is within approximately 10km of Vijayawada center
        const [lng, lat] = location.center;
        
        // Smooth fly to the searched location
        flyToLocation(lng, lat, 15);
        
        // Show success notification
        addToast(`Location found: ${location.place_name}`, 'success', 3000);
        
        // Check if the location matches any of our landmarks or garbage points
        const matchedLandmark = VIJAYAWADA_LANDMARKS.find(landmark => 
          Math.abs(landmark.latitude - lat) < 0.005 && 
          Math.abs(landmark.longitude - lng) < 0.005
        );
        
        const matchedGarbage = GARBAGE_COLLECTION_POINTS.find(point => 
          Math.abs(point.latitude - lat) < 0.005 && 
          Math.abs(point.longitude - lng) < 0.005
        );
        
        if (matchedLandmark) {
          setSelectedLandmark(matchedLandmark);
        } else if (matchedGarbage) {
          setSelectedGarbage(matchedGarbage);
        }
      } else {
        addToast("No results found in Vijayawada", 'warning', 3000);
      }
    } catch (error) {
      console.error('Error searching location:', error);
      setError(error.message || 'Error searching for location');
      addToast(error.message || 'Error searching for location', 'error', 5000);
    } finally {
      setLoading(false);
    }
  };
  
  // Smooth fly to a location
  const flyToLocation = (longitude, latitude, zoom = 14, pitch = 45) => {
    mapRef.current?.flyTo({
      center: [longitude, latitude],
      zoom: zoom,
      pitch: pitch,
      bearing: 0,
      duration: 2000,
      essential: true
    });
  };
  
  // Handle clicking on a landmark marker
  const handleLandmarkClick = (landmark) => {
    setSelectedLandmark(landmark);
    setSelectedGarbage(null);
    addToast(`Selected: ${landmark.name}`, 'info', 2000);
    
    // Fly to the selected landmark
    flyToLocation(landmark.longitude, landmark.latitude, 16);
  };
  
  // Handle clicking on a garbage collection point
  const handleGarbageClick = (point) => {
    setSelectedGarbage(point);
    setSelectedLandmark(null);
    
    const statusText = {
      normal: 'Normal operation',
      attention: 'Needs attention',
      critical: 'Critical - urgent collection needed'
    };
    
    addToast(`Garbage Collection Point: ${statusText[point.status]}`, point.status === 'critical' ? 'error' : point.status === 'attention' ? 'warning' : 'success', 3000);
    
    // Fly to the garbage collection point
    flyToLocation(point.longitude, point.latitude, 17);
  };

  // Reset view to show all of Vijayawada
  const resetView = () => {
    setSelectedLandmark(null);
    setSelectedGarbage(null);
    setActiveCategory(null);
    
    mapRef.current?.flyTo({
      ...DEFAULT_VIEWPORT,
      duration: 1500,
      essential: true
    });
    
    addToast('View reset to Vijayawada city center', 'info', 2000);
  };

  // Toggle legend visibility
  const toggleLegend = () => {
    setShowLegend(!showLegend);
    addToast(`Map legend ${!showLegend ? 'shown' : 'hidden'}`, 'info', 2000);
  };

  // Filter by category
  const handleCategoryFilter = (category) => {
    if (activeCategory === category) {
      setActiveCategory(null);
      addToast('Showing all landmarks', 'info', 2000);
    } else {
      setActiveCategory(category);
      addToast(`Filtering: ${category.charAt(0).toUpperCase() + category.slice(1)} landmarks`, 'info', 2000);
    }
  };

  // Toggle info panel
  const toggleInfo = () => {
    setShowInfo(!showInfo);
  };
  
  // Toggle garbage monitor panel
  const toggleGarbageMonitor = () => {
    setShowGarbageMonitor(!showGarbageMonitor);
    
    if (!showGarbageMonitor) {
      // If we're showing the monitor, auto-select garbage category
      setActiveCategory(CATEGORIES.GARBAGE);
      addToast('Showing garbage collection points', 'info', 2000);
    }
  };

  // Handler for viewing location statistics (navigate to stats page)
  const handleViewStats = (landmark) => {
    addToast(`Loading statistics for ${landmark.name}...`, 'info', 2000);
    // Navigate to the stats page with the location ID
    navigate(`/location/${landmark.id}/stats`);
  };
  
  // Handler for viewing location photos (navigate to photos page)
  const handleViewPhotos = (landmark) => {
    addToast(`Loading photos for ${landmark.name}...`, 'info', 2000);
    // Navigate to the photos page with the location ID
    navigate(`/location/${landmark.id}/photos`);
  };

  return (
    <div className="vijayawada-map-container">
      <LoadingOverlay loading={loading} />
      
      <SearchBar 
        onSearch={handleSearch} 
        loading={loading} 
        error={error} 
        placeholder="Search places in Vijayawada..." 
      />
      
      <div className="map-control-panel">
        <button 
          className="map-control-button"
          onClick={resetView}
          title="Reset view"
        >
          <span className="control-icon">🔄</span>
          <span className="control-text">Reset</span>
        </button>
        
        <button 
          className="map-control-button"
          onClick={toggleLegend}
          title={showLegend ? "Hide legend" : "Show legend"}
        >
          <span className="control-icon">🗺️</span>
          <span className="control-text">{showLegend ? "Hide" : "Show"} Legend</span>
        </button>
        
        <button 
          className={`map-control-button ${showGarbageMonitor ? 'active' : ''}`}
          onClick={toggleGarbageMonitor}
          title="Garbage Monitoring"
        >
          <span className="control-icon">🗑️</span>
          <span className="control-text">Garbage Monitor</span>
        </button>
        
        <button 
          className="map-control-button"
          onClick={toggleInfo}
          title={showInfo ? "Hide info" : "Show info"}
        >
          <span className="control-icon">ℹ️</span>
          <span className="control-text">About Map</span>
        </button>
      </div>
      
      {showInfo && (
        <MapInfo onClose={() => setShowInfo(false)} />
      )}
      
      {showGarbageMonitor && (
        <GarbageMonitor 
          garbagePoints={GARBAGE_COLLECTION_POINTS} 
          stats={garbageStats} 
          onClose={() => setShowGarbageMonitor(false)}
          onPointSelect={handleGarbageClick}
        />
      )}
      
      {showLegend && (
        <div className="category-filter">
          <h3>Filter Places</h3>
          <div className="filter-options">
            {Object.entries(CATEGORIES).map(([key, value]) => (
              <button 
                key={value}
                className={`filter-button ${activeCategory === value ? 'active' : ''}`}
                style={{ 
                  backgroundColor: activeCategory === value ? 
                    (value === CATEGORIES.GARBAGE ? '#333' : MARKER_COLORS[value]) : 
                    'rgba(255,255,255,0.7)',
                  color: activeCategory === value ? '#fff' : '#333'
                }}
                onClick={() => handleCategoryFilter(value)}
              >
                <span 
                  className="category-icon" 
                  style={{ 
                    backgroundColor: value === CATEGORIES.GARBAGE ? '#333' : MARKER_COLORS[value]
                  }}
                ></span>
                {key.charAt(0) + key.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      <Map
        ref={mapRef}
        initialViewState={viewport}
        onMove={evt => setViewport(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapSettings?.mapStyle || "mapbox://styles/mapbox/streets-v12"}
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={['vijayawada-boundary-fill']}
      >
        <GeolocateControl position="top-right" />
        <NavigationControl position="top-right" />
        
        {/* Vijayawada City Boundary */}
        <Source id="vijayawada-boundary" type="geojson" data={VIJAYAWADA_BOUNDARY}>
          <Layer
            id="vijayawada-boundary-fill"
            type="fill"
            paint={{
              'fill-color': 'rgba(0, 170, 68, 0.1)',
              'fill-outline-color': '#00aa44'
            }}
          />
          <Layer
            id="vijayawada-boundary-line"
            type="line"
            paint={{
              'line-color': '#00aa44',
              'line-width': 2,
              'line-dasharray': [3, 2]
            }}
          />
        </Source>

        {/* Render markers for each landmark */}
        {filteredLandmarks.map(landmark => (
          <Marker
            key={landmark.id}
            latitude={landmark.latitude}
            longitude={landmark.longitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              handleLandmarkClick(landmark);
            }}
          >
            <div 
              className={`landmark-marker ${selectedLandmark?.id === landmark.id ? 'active' : ''}`}
              style={{ 
                backgroundColor: MARKER_COLORS[landmark.category],
                borderColor: selectedLandmark?.id === landmark.id ? "#FFFFFF" : "rgba(0,0,0,0.2)"
              }}
            >
              <span className="landmark-marker-label">{landmark.name.split(' ')[0]}</span>
            </div>
          </Marker>
        ))}
        
        {/* Render garbage collection point markers */}
        {(activeCategory === null || activeCategory === CATEGORIES.GARBAGE) && 
          GARBAGE_COLLECTION_POINTS.map(point => (
            <Marker
              key={point.id}
              latitude={point.latitude}
              longitude={point.longitude}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handleGarbageClick(point);
              }}
            >
              <div 
                className={`garbage-marker ${selectedGarbage?.id === point.id ? 'active' : ''} ${point.status}`}
                style={{ 
                  borderColor: selectedGarbage?.id === point.id ? "#FFFFFF" : "rgba(0,0,0,0.2)"
                }}
              >
                <div 
                  className="fill-indicator" 
                  style={{ height: `${point.fillLevel}%` }}
                ></div>
                <span className="garbage-marker-label">
                  {point.fillLevel}%
                </span>
              </div>
            </Marker>
          ))
        }

        {/* Popup for selected landmark */}
        {selectedLandmark && (
          <Popup
            latitude={selectedLandmark.latitude}
            longitude={selectedLandmark.longitude}
            closeOnClick={false}
            onClose={() => setSelectedLandmark(null)}
            anchor="top"
            offset={20}
            className="landmark-popup"
            maxWidth="350px"
          >
            <div className="popup-content">
              <div className="popup-header" style={{ backgroundColor: MARKER_COLORS[selectedLandmark.category] }}>
                <h3>{selectedLandmark.name}</h3>
                <span className="category-badge">
                  {selectedLandmark.category.charAt(0).toUpperCase() + selectedLandmark.category.slice(1)}
                </span>
              </div>
              
              <div className="popup-image-container">
                <img src={selectedLandmark.image} alt={selectedLandmark.name} />
              </div>
              
              <p className="popup-description">{selectedLandmark.description}</p>
              
              <div className="popup-footer">
                <button 
                  className="popup-action-button"
                  onClick={() => handleViewStats(selectedLandmark)}
                >
                  <span className="action-icon">📊</span>
                  Stats
                </button>
                <button 
                  className="popup-action-button"
                  onClick={() => handleViewPhotos(selectedLandmark)}
                >
                  <span className="action-icon">📷</span>
                  Photos
                </button>
              </div>
            </div>
          </Popup>
        )}
        
        {/* Popup for selected garbage collection point */}
        {selectedGarbage && (
          <Popup
            latitude={selectedGarbage.latitude}
            longitude={selectedGarbage.longitude}
            closeOnClick={false}
            onClose={() => setSelectedGarbage(null)}
            anchor="top"
            offset={20}
            className="garbage-popup"
            maxWidth="350px"
          >
            <div className="popup-content">
              <div className="popup-header garbage-header" style={{ 
                backgroundColor: GARBAGE_STATUS_COLORS[selectedGarbage.status] 
              }}>
                <h3>{selectedGarbage.name}</h3>
                <span className={`status-badge ${selectedGarbage.status}`}>
                  {selectedGarbage.status.charAt(0).toUpperCase() + selectedGarbage.status.slice(1)}
                </span>
              </div>
              
              <div className="garbage-stats">
                <div className="stat-item">
                  <span className="stat-value">{selectedGarbage.fillLevel}%</span>
                  <span className="stat-label">Fill Level</span>
                </div>
                
                <div className="stat-item">
                  <span className="stat-value">
                    {new Date(selectedGarbage.lastCollected).toLocaleDateString()}
                  </span>
                  <span className="stat-label">Last Collected</span>
                </div>
                
                <div className="stat-item">
                  <span className="stat-value">
                    {new Date(selectedGarbage.lastCollected).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <span className="stat-label">Time</span>
                </div>
              </div>
              
              <p className="popup-description">{selectedGarbage.address}</p>
              
              <div className="popup-footer">
                <button 
                  className="popup-action-button"
                  onClick={() => {
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedGarbage.latitude},${selectedGarbage.longitude}&travelmode=driving`, '_blank');
                  }}
                >
                  <span className="action-icon">🚗</span>
                  Directions
                </button>
                <button 
                  className="popup-action-button report-button"
                  onClick={() => {
                    addToast("Report submitted to municipal authorities", "success", 3000);
                  }}
                >
                  <span className="action-icon">⚠️</span>
                  Report Issue
                </button>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      <div className="map-footer">
        <button 
          className="municipal-portal-button"
          onClick={() => window.open('https://cdma.ap.gov.in/VMC/index.jsp', '_blank')}
        >
          <span className="portal-icon">🏛️</span>
          Municipal Portal
        </button>
      </div>

      <Attribution />
    </div>
  );
};

export default ElectoralMap;
