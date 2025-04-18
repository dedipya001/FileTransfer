// src/components/map/LocationStats.jsx
import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const LocationStats = ({ location, onClose }) => {
  const [stats, setStats] = useState({
    visitors: [],
    distribution: [],
    totalVisitors: 0,
    averageRating: 0,
    returnRate: 0,
    loading: true,
    error: null
  });
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/stats/location/${location.id}`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        
        const data = await response.json();
        setStats({
          visitors: data.visitors,
          distribution: data.distribution,
          totalVisitors: data.totalVisitors,
          averageRating: data.averageRating,
          returnRate: data.returnRate,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: "Failed to load statistics. Please check if the backend server is running."
        }));
      }
    };
    
    fetchStats();
  }, [location.id]);

  // Colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  
  // Marker colors (same as in ElectoralMap)
  const MARKER_COLORS = {
    "historic": "#FF9800",      // Orange
    "religious": "#FFC107",     // Amber
    "educational": "#3F51B5",   // Indigo
    "commercial": "#9C27B0",    // Purple
    "recreation": "#4CAF50",    // Green
    "transport": "#F44336",     // Red
    "infrastructure": "#2196F3", // Blue
    "government": "#795548",    // Brown
    "market": "#FF5722",        // Deep Orange
    "hospital": "#E91E63",      // Pink
    "library": "#673AB7",       // Deep Purple
  };

  const formatDateLabel = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()} Apr`;
  };

  return (
    <div className="location-stats-panel">
      <div className="stats-header">
        <h2>Statistics for {location.name}</h2>
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      
      {stats.loading ? (
        <div className="stats-loading">
          <div className="spinner"></div>
          Loading statistics...
        </div>
      ) : stats.error ? (
        <div className="stats-error">
          <p>{stats.error}</p>
          <button 
            className="retry-button"
            onClick={() => setStats(prev => ({ ...prev, loading: true, error: null }))}
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="stats-content">
          <div className="stats-section">
            <h3>Monthly Visitors (April 2025)</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={stats.visitors}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDateLabel}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value} visitors`, "Count"]}
                    labelFormatter={(label) => `Date: ${formatDateLabel(label)}`}
                  />
                  <Legend />
                  <Bar 
                    dataKey="visitors" 
                    name="Visitors"
                    fill={MARKER_COLORS[location.category] || "#8884d8"}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="stats-section">
            <h3>Visitor Distribution by Time of Day</h3>
            <div className="chart-container pie-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.distribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="stats-metrics">
            <div className="metric-card">
              <span className="metric-value">{stats.totalVisitors.toLocaleString()}</span>
              <span className="metric-label">Monthly Visitors</span>
            </div>
            <div className="metric-card">
              <span className="metric-value">{stats.averageRating}</span>
              <span className="metric-label">Average Rating</span>
            </div>
            <div className="metric-card">
              <span className="metric-value">{stats.returnRate}%</span>
              <span className="metric-label">Return Rate</span>
            </div>
          </div>
          
          <div className="stats-footer">
            <p className="stats-disclaimer">
              Data is based on visitor statistics for April 2025. Updated daily.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationStats;
