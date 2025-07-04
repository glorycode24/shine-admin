import React, { useState, useEffect } from 'react';
import loggingService, { ACTIVITY_TYPES, LOG_LEVELS } from '../services/loggingService';
import './SessionLogs.css';

function SessionLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: '',
    level: '',
    limit: 50
  });

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await loggingService.getLogs(filters);
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setLogs(data);
      } else if (data && Array.isArray(data.logs)) {
        // If backend returns { logs: [...] }
        setLogs(data.logs);
      } else if (data && Array.isArray(data.data)) {
        // If backend returns { data: [...] }
        setLogs(data.data);
      } else {
        // If data is not an array, set empty array and show warning
        console.warn('Backend returned non-array data:', data);
        setLogs([]);
        setError('Invalid data format received from server.');
      }
      
      setError('');
    } catch (err) {
      setError('Failed to load session logs.');
      console.error('Error fetching logs:', err);
      setLogs([]); // Ensure logs is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      type: '',
      level: '',
      limit: 50
    });
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getLevelBadgeClass = (level) => {
    if (!level) return 'badge-default';
    switch (level.toUpperCase()) {
      case 'INFO': return 'badge-info';
      case 'WARNING': return 'badge-warning';
      case 'ERROR': return 'badge-error';
      case 'CRITICAL': return 'badge-critical';
      default: return 'badge-info';
    }
  };

  const getTypeBadgeClass = (type) => {
    if (!type) return 'badge-default';
    switch (type.toUpperCase()) {
      case 'AUTHENTICATION': return 'badge-auth';
      case 'PRODUCT_MANAGEMENT': return 'badge-product';
      case 'CATEGORY_MANAGEMENT': return 'badge-category';
      case 'USER_MANAGEMENT': return 'badge-user';
      case 'SYSTEM': return 'badge-system';
      default: return 'badge-default';
    }
  };

  // Validate log object to ensure it has required properties
  const validateLog = (log) => {
    return {
      timestamp: log.timestamp || null,
      adminId: log.adminId || log.admin_id || 'N/A',
      adminEmail: log.adminEmail || log.admin_email || 'N/A',
      type: log.type || 'UNKNOWN',
      action: log.action || 'UNKNOWN',
      level: log.level || 'INFO',
      description: log.description || 'No description',
      details: log.details || {}
    };
  };

  if (loading) {
    return (
      <div className="manager-section">
        <h2>Session Logs</h2>
        <div className="loading-message">Loading session logs...</div>
      </div>
    );
  }

  return (
    <div className="manager-section">
      <h2>Session Logs</h2>
      
      {/* Filters */}
      <div className="logs-filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>Start Date:</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>End Date:</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label>Activity Type:</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">All Types</option>
              {Object.values(ACTIVITY_TYPES).map(type => (
                <option key={type} value={type}>{type.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Log Level:</label>
            <select
              value={filters.level}
              onChange={(e) => handleFilterChange('level', e.target.value)}
            >
              <option value="">All Levels</option>
              {Object.values(LOG_LEVELS).map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Limit:</label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', e.target.value)}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
        </div>
        <div className="filter-actions">
          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
          <button onClick={fetchLogs} className="refresh-btn">
            Refresh
          </button>
        </div>
      </div>

      {error && <p className="message error">{error}</p>}

      {/* Logs Table */}
      <div className="logs-table-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Admin</th>
              <th>Type</th>
              <th>Action</th>
              <th>Level</th>
              <th>Description</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-logs">
                  No logs found for the selected filters.
                </td>
              </tr>
            ) : (
              logs.map((log, index) => {
                const validatedLog = validateLog(log);
                return (
                  <tr key={index} className={`log-row level-${validatedLog.level.toLowerCase()}`}>
                    <td className="timestamp">{formatTimestamp(validatedLog.timestamp)}</td>
                    <td className="admin-info">
                      <div>{validatedLog.adminEmail}</div>
                      <small>ID: {validatedLog.adminId}</small>
                    </td>
                    <td>
                      <span className={`badge ${getTypeBadgeClass(validatedLog.type)}`}>
                        {validatedLog.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="action">{validatedLog.action}</td>
                    <td>
                      <span className={`badge ${getLevelBadgeClass(validatedLog.level)}`}>
                        {validatedLog.level}
                      </span>
                    </td>
                    <td className="description">{validatedLog.description}</td>
                    <td className="details">
                      {validatedLog.details && Object.keys(validatedLog.details).length > 0 ? (
                        <details>
                          <summary>View Details</summary>
                          <pre>{JSON.stringify(validatedLog.details, null, 2)}</pre>
                        </details>
                      ) : (
                        <span className="no-details">No details</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {logs.length > 0 && (
        <div className="logs-summary">
          <p>Showing {logs.length} log entries</p>
        </div>
      )}
    </div>
  );
}

export default SessionLogs; 