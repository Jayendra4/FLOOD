import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { getAllReports, updateReport } from '../utils/api';
import {
  IconClipboard,
  IconAlert,
  IconClock,
  IconCheck,
  IconSearch,
  IconInbox,
  IconX,
} from '../components/Icons';

export default function AdminDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', severity: '', status: '' });
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getAllReports({
        severity: filters.severity || undefined,
        status: filters.status || undefined
      });
      let filteredReports = res.data.reports;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredReports = filteredReports.filter(report =>
          report._id.toLowerCase().includes(searchLower) ||
          report.city.toLowerCase().includes(searchLower) ||
          report.locality.toLowerCase().includes(searchLower) ||
          (report.description && report.description.toLowerCase().includes(searchLower))
        );
      }
      setReports(filteredReports);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await updateReport(id, { status: status });
      setReports(reports.map(r => r._id === id ? { ...r, status: status } : r));
      if (selectedReport && selectedReport._id === id) {
        setSelectedReport({ ...selectedReport, status: status });
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const formatDate = (report) => {
    if (report?.createdAtIST) return report.createdAtIST;
    if (!report?.createdAt) return '—';
    return new Date(report.createdAt).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }) + ' IST';
  };

  return (
    <>
      <Header isAdmin={true} />
      <div className="container fade-in">
        <h2 className="dashboard-title">Flood Reports Dashboard</h2>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon blue">
              <IconClipboard size={24} />
            </div>
            <div>
              <div className="stat-value">{reports.length}</div>
              <div className="stat-label">Total Reports</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red">
              <IconAlert size={24} />
            </div>
            <div>
              <div className="stat-value">{reports.filter(r => r.severity === 'critical').length}</div>
              <div className="stat-label">Critical Incidents</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon yellow">
              <IconClock size={24} />
            </div>
            <div>
              <div className="stat-value">{reports.filter(r => !r.status || r.status === 'pending').length}</div>
              <div className="stat-label">Pending Action</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green">
              <IconCheck size={24} />
            </div>
            <div>
              <div className="stat-value">{reports.filter(r => r.status === 'resolved').length}</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>
        </div>

        <div className="filters-bar">
          <form
            onSubmit={(e) => { e.preventDefault(); fetchData(); }}
            className="filters-form"
          >
            <input
              type="text"
              className="form-input search-input"
              placeholder="Search by ID, location, or description..."
              value={filters.search}
              onChange={e => setFilters({ ...filters, search: e.target.value })}
            />
            <button type="submit" className="gps-btn btn-sm" style={{ margin: 0 }}>
              <IconSearch size={16} />
              Search
            </button>
          </form>

          <select
            className="form-select filter-select"
            value={filters.severity}
            onChange={e => setFilters({ ...filters, severity: e.target.value })}
          >
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <select
            className="form-select filter-select"
            value={filters.status}
            onChange={e => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="table-container">
          {loading ? (
            <div className="loading-center">
              <span className="spinner"></span>
              Loading reports…
            </div>
          ) : reports.length === 0 ? (
            <div className="empty-state">
              <div className="icon-wrap">
                <IconInbox size={32} />
              </div>
              <p>No reports found matching your criteria</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Date & Time</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(r => (
                  <tr key={r._id}>
                    <td className="table-id">{r._id}</td>
                    <td>{formatDate(r)}</td>
                    <td>{r.locality}, {r.city}</td>
                    <td>{r.incidentType?.replace('_', ' ')}</td>
                    <td><span className={`badge badge-${r.severity}`}>{r.severity}</span></td>
                    <td>
                      <select
                        className={`status-select badge badge-${r.status || 'pending'}`}
                        value={r.status || 'pending'}
                        onChange={(e) => handleStatusChange(r._id, e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="page-btn btn-sm"
                        onClick={() => setSelectedReport(r)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-content fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Report Details: {selectedReport._id}</h2>
              <button
                className="modal-close"
                onClick={() => setSelectedReport(null)}
                aria-label="Close"
              >
                <IconX size={18} />
              </button>
            </div>

            <div className="detail-grid">
              <div className="detail-item">
                <label>Date & Time</label>
                <span>{formatDate(selectedReport)}</span>
              </div>
              <div className="detail-item">
                <label>Status</label>
                <select
                  className={`status-select badge badge-${selectedReport.status || 'pending'}`}
                  value={selectedReport.status || 'pending'}
                  onChange={(e) => handleStatusChange(selectedReport._id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div className="detail-item">
                <label>Incident Type</label>
                <span style={{ textTransform: 'capitalize' }}>{selectedReport.incidentType?.replace('_', ' ')}</span>
              </div>
              <div className="detail-item">
                <label>Severity</label>
                <span className={`badge badge-${selectedReport.severity}`}>{selectedReport.severity}</span>
              </div>
              <div className="detail-item">
                <label>Location</label>
                <span>{selectedReport.locality}, {selectedReport.wardZone ? `${selectedReport.wardZone}, ` : ''}{selectedReport.city}</span>
              </div>
              <div className="detail-item">
                <label>Water Depth</label>
                <span>{selectedReport.waterDepth ? `${selectedReport.waterDepth} ${selectedReport.depthUnit}` : 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Reporter Name</label>
                <span>{selectedReport.fullName || 'Anonymous'}</span>
              </div>
            </div>

            {selectedReport.description && (
              <div className="detail-item detail-section">
                <label>Description</label>
                <div className="detail-description">
                  {selectedReport.description}
                </div>
              </div>
            )}

            {selectedReport.photoUrls?.length > 0 || selectedReport.videoUrls?.length > 0 ? (
              <div className="detail-item detail-section">
                <label className="detail-section-title">Attached Media</label>
                <div className="media-gallery">
                  {selectedReport.photoUrls?.map((url, i) => (
                    <a key={`photo-${i}`} href={url} target="_blank" rel="noreferrer">
                      <img src={url} alt="Report photo" />
                    </a>
                  ))}
                  {selectedReport.videoUrls?.map((url, i) => (
                    <video key={`video-${i}`} src={url} controls />
                  ))}
                </div>
              </div>
            ) : null}

            {selectedReport.latitude && selectedReport.longitude && (
              <div className="detail-item detail-section">
                <label className="detail-section-title">Map Location</label>
                <div className="map-embed">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    title="Report location map"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedReport.longitude - 0.005},${selectedReport.latitude - 0.005},${selectedReport.longitude + 0.005},${selectedReport.latitude + 0.005}&layer=mapnik&marker=${selectedReport.latitude},${selectedReport.longitude}`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
