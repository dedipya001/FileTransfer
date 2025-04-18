// src/pages/LocationStatsPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import '../styles/locationStatsPage.css';

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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

const LocationStatsPage = () => {
  const { locationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [stats, setStats] = useState(null);
  const [garbageData, setGarbageData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('daily');

  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        // Fetch location details
        const locationResponse = await fetch(`http://localhost:5000/api/locations/${locationId}`);
        if (!locationResponse.ok) throw new Error('Failed to fetch location data');
        const locationData = await locationResponse.json();
        setLocation(locationData);
        
        // Fetch basic stats
        const statsResponse = await fetch(`http://localhost:5000/api/stats/location/${locationId}`);
        if (!statsResponse.ok) throw new Error('Failed to fetch stats data');
        const statsData = await statsResponse.json();
        setStats(statsData);
        
        // Fetch garbage analysis data (mock for now)
        // In a real implementation, this would come from your ML model results stored in the database
        const garbageAnalysisData = generateMockGarbageData();
        setGarbageData(garbageAnalysisData);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message);
        setLoading(false);
      }
    };
    
    fetchLocationData();
  }, [locationId]);

  // Generate mock garbage data (replace with actual data from your YOLO model in production)
  const generateMockGarbageData = () => {
    // Daily data for April 2025
    const dailyData = [];
    for (let day = 1; day <= 30; day++) {
      const date = new Date(2025, 3, day);
      const formattedDate = `${day} Apr`;
      
      dailyData.push({
        date: formattedDate,
        garbagePercentage: Math.random() * 25, // Random value between 0-25%
        avgCoverage: Math.random() * 30,
        imageCount: 5, // 5 images per day as per your requirement
      });
    }
    
    // Weekly data
    const weeklyData = [];
    for (let week = 1; week <= 5; week++) {
      weeklyData.push({
        week: `Week ${week}`,
        garbagePercentage: Math.random() * 25,
        avgCoverage: Math.random() * 30,
        imageCount: 5 * 7, // 5 images per day for 7 days
      });
    }
    
    // Distribution data for pie chart
    const distributionData = [
      { name: "0-5%", value: Math.floor(Math.random() * 40) + 10 },
      { name: "5-10%", value: Math.floor(Math.random() * 30) + 10 },
      { name: "10-15%", value: Math.floor(Math.random() * 20) + 10 },
      { name: "15-20%", value: Math.floor(Math.random() * 15) + 5 },
      { name: "20%+", value: Math.floor(Math.random() * 10) + 5 },
    ];
    
    // Hotspot data
    const hotspotData = [
      { area: "North Zone", percentage: Math.random() * 35 },
      { area: "South Zone", percentage: Math.random() * 35 },
      { area: "East Zone", percentage: Math.random() * 35 },
      { area: "West Zone", percentage: Math.random() * 35 },
      { area: "Central", percentage: Math.random() * 35 },
    ];
    
    return {
      daily: dailyData,
      weekly: weeklyData,
      distribution: distributionData,
      hotspots: hotspotData,
      summary: {
        averageGarbagePercentage: (Math.random() * 15).toFixed(2),
        highestRecorded: (Math.random() * 30 + 10).toFixed(2),
        totalImagesAnalyzed: 5 * 30, // 5 images per day for 30 days
        wasteFreePercentage: (Math.random() * 100).toFixed(1),
        mostAffectedArea: hotspotData.sort((a, b) => b.percentage - a.percentage)[0].area
      }
    };
  };

  const renderDateAxis = (dateStr) => {
    return dateStr;
  };

  // Handle period change
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  if (loading) {
    return (
      <div className="location-stats-page loading-container">
        <div className="spinner"></div>
        <h2>Loading statistics...</h2>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="location-stats-page error-container">
        <h2>Error Loading Statistics</h2>
        <p>{error || "Location not found"}</p>
        <Link to="/map" className="back-button">Return to Map</Link>
      </div>
    );
  }

  const timeSeriesData = selectedPeriod === 'daily' ? garbageData.daily : garbageData.weekly;
  const xAxisKey = selectedPeriod === 'daily' ? 'date' : 'week';

  return (
    <div className="location-stats-page">
      <header className="stats-page-header" style={{ backgroundColor: MARKER_COLORS[location.category] }}>
        <div className="header-content">
          <h1>{location.name} - Statistics</h1>
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
      
      <div className="stats-summary">
        <div className="summary-card">
          <h3>Average Garbage</h3>
          <div className="summary-value">{garbageData.summary.averageGarbagePercentage}%</div>
          <div className="summary-label">of image area</div>
        </div>
        <div className="summary-card">
          <h3>Highest Recorded</h3>
          <div className="summary-value">{garbageData.summary.highestRecorded}%</div>
          <div className="summary-label">coverage</div>
        </div>
        <div className="summary-card">
          <h3>Images Analyzed</h3>
          <div className="summary-value">{garbageData.summary.totalImagesAnalyzed}</div>
          <div className="summary-label">total images</div>
        </div>
        <div className="summary-card">
          <h3>Waste-Free</h3>
          <div className="summary-value">{garbageData.summary.wasteFreePercentage}%</div>
          <div className="summary-label">of all images</div>
        </div>
        <div className="summary-card">
          <h3>Most Affected</h3>
          <div className="summary-value">{garbageData.summary.mostAffectedArea}</div>
          <div className="summary-label">area</div>
        </div>
      </div>
      
      <div className="stats-controls">
        <h2>Garbage Detection Time Series</h2>
        <div className="period-selector">
          <button 
            className={`period-button ${selectedPeriod === 'daily' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('daily')}
          >
            Daily
          </button>
          <button 
            className={`period-button ${selectedPeriod === 'weekly' ? 'active' : ''}`}
            onClick={() => handlePeriodChange('weekly')}
          >
            Weekly
          </button>
        </div>
      </div>
      
      <div className="chart-container time-series">
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={timeSeriesData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} tick={{ fontSize: 12 }} tickFormatter={renderDateAxis} />
            <YAxis label={{ value: 'Garbage %', angle: -90, position: 'insideLeft' }} />
            <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, "Garbage Coverage"]} />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="garbagePercentage" 
              name="Garbage Percentage" 
              stroke={MARKER_COLORS[location.category]} 
              fill={`${MARKER_COLORS[location.category]}80`} 
              activeDot={{ r: 8 }} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div className="stats-row">
        <div className="stats-column">
          <h2>Garbage Distribution</h2>
          <div className="chart-container pie-chart">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={garbageData.distribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {garbageData.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} images`, "Count"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="stats-column">
          <h2>Garbage Hotspots</h2>
          <div className="chart-container bar-chart">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={garbageData.hotspots} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 'dataMax + 5']} />
                <YAxis dataKey="area" type="category" scale="band" />
                <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, "Garbage Percentage"]} />
                <Legend />
                <Bar dataKey="percentage" name="Garbage %" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="stats-actions">
        <Link to={`/location/${locationId}/photos`} className="action-button view-photos">
          <span className="action-icon">📷</span>
          View Photos
        </Link>
        <Link to="/map" className="action-button back-map">
          <span className="action-icon">🗺️</span>
          Return to Map
        </Link>
        <button className="action-button download-report" onClick={() => alert('PDF report generation will be available in the next update.')}>
          <span className="action-icon">📊</span>
          Download Report
        </button>
      </div>
      
      <footer className="stats-footer">
        <p>Garbage detection powered by YOLOv8 ML model. Data analysis based on images from April 2025.</p>
        <p>For more information about the waste management system, please contact municipal authorities.</p>
      </footer>
    </div>
  );
};

export default LocationStatsPage;
