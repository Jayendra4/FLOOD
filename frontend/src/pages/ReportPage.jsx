import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import MapPicker from '../components/MapPicker';
import MediaUpload from '../components/MediaUpload';
import { submitReport } from '../utils/api';
import {
  IconUser,
  IconMapPin,
  IconAlert,
  IconCamera,
  IconShield,
  IconCheck,
  IconCloudUpload,
  IconFileText,
} from '../components/Icons';

const INCIDENT_TYPES = [
  { value: '', label: 'Select incident type' },
  { value: 'waterlogging', label: 'Waterlogging' },
  { value: 'flash_flood', label: 'Flash Flood' },
  { value: 'drain_overflow', label: 'Drain Overflow' },
  { value: 'road_submerged', label: 'Road Submerged' },
  { value: 'house_flooded', label: 'House Flooded' },
  { value: 'basement_flooded', label: 'Basement Flooded' },
  { value: 'tree_fall', label: 'Tree Fall' },
  { value: 'power_disruption', label: 'Power Disruption' },
  { value: 'drainage_blockage', label: 'Drainage Blockage' },
  { value: 'other', label: 'Other' },
];
const SEVERITIES = ['low', 'moderate', 'high', 'critical'];

const INITIAL_FORM = {
  fullName: '',
  city: '',
  wardZone: '',
  locality: '',
  pincode: '',
  landmark: '',
  latitude: 28.6139,
  longitude: 77.209,
  address: '',
  incidentType: '',
  waterDepth: '',
  depthUnit: 'cm',
  severity: 'moderate',
  description: '',
  remarks: '',
};

export default function ReportPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('floodReportDraft');
    if (saved) {
      try {
        setForm(JSON.parse(saved));
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('floodReportDraft', JSON.stringify(form));
  }, [form]);

  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleMapChange = (lat, lng, formattedAddress) => {
    setForm((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: formattedAddress || prev.address,
    }));
  };

  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = 'Full Name is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.locality.trim()) errs.locality = 'Locality is required';
    if (!form.incidentType) errs.incidentType = 'Select an incident type';
    if (photos.length === 0 && videos.length === 0)
      errs.media = 'At least one photo or video is required';
    if (!consent) errs.consent = 'You must consent to submit';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setMessage('');

    try {
      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value);
        }
      });

      photos.forEach((photo) => formData.append('photos', photo.file));
      videos.forEach((video) => formData.append('videos', video.file));

      const res = await submitReport(formData);
      setSuccess(res.data.report._id);
      setMessage('Report submitted successfully!');
      setMessageType('success');
      localStorage.removeItem('floodReportDraft');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error('Submission error:', err);
      setMessage(
        'Submission failed: ' + (err.response?.data?.message || err.message)
      );
      setMessageType('error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setPhotos([]);
    setVideos([]);
    setConsent(false);
    setSuccess(null);
    setErrors({});
    setMessage('');
  };

  if (success) {
    return (
      <>
        <Header showAdmin={false} />
        <div className="container">
          <div className="success-container card fade-in">
            <div className="success-icon">
              <IconCheck size={40} strokeWidth={2.5} />
            </div>
            <h2>Report Submitted Successfully!</h2>
            <p>Your report has been recorded and authorities have been notified.</p>
            <div className="report-id-box">
              <div className="label">Your Report ID</div>
              <div className="id">{success}</div>
              <div className="hint">Save this ID for future reference</div>
            </div>
            <button className="submit-btn" onClick={resetForm}>
              <IconFileText size={20} />
              Submit Another Report
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header showAdmin={false} />
      <div className="container">
        <div className="page-intro">
          <h2>Report a Flood Incident</h2>
          <p>
            Help emergency services respond faster by submitting accurate location
            details and photos of the flooding in your area.
          </p>
        </div>

        {message && (
          <div
            className={`alert fade-in ${
              messageType === 'success' ? 'alert-success' : 'alert-error'
            }`}
            style={{ marginBottom: 20 }}
          >
            <span className="alert-icon">
              {messageType === 'success' ? (
                <IconCheck size={22} />
              ) : (
                <IconAlert size={22} />
              )}
            </span>
            {message}
          </div>
        )}

        <div className="form-container">
          <form onSubmit={handleSubmit} className="card-stack">
            <div className="card fade-in">
              <div className="card-title">
                <span className="icon-wrap">
                  <IconUser size={18} />
                </span>
                Personal Information
              </div>
              <div className="form-group">
                <label className="form-label">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  className="form-input"
                  value={form.fullName}
                  onChange={(e) => update('fullName', e.target.value)}
                  placeholder="Your full name"
                />
                {errors.fullName && (
                  <div className="form-error">{errors.fullName}</div>
                )}
              </div>
            </div>

            <div className="card fade-in stagger-1">
              <div className="card-title">
                <span className="icon-wrap">
                  <IconMapPin size={18} />
                </span>
                Location Details
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    City <span className="required">*</span>
                  </label>
                  <input
                    className="form-input"
                    value={form.city}
                    onChange={(e) => update('city', e.target.value)}
                    placeholder="e.g., Delhi, Mumbai"
                  />
                  {errors.city && <div className="form-error">{errors.city}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Ward/Zone</label>
                  <input
                    className="form-input"
                    value={form.wardZone}
                    onChange={(e) => update('wardZone', e.target.value)}
                    placeholder="Ward or zone name"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    Locality <span className="required">*</span>
                  </label>
                  <input
                    className="form-input"
                    value={form.locality}
                    onChange={(e) => update('locality', e.target.value)}
                    placeholder="Area or neighborhood"
                  />
                  {errors.locality && (
                    <div className="form-error">{errors.locality}</div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input
                    className="form-input"
                    value={form.pincode}
                    onChange={(e) => update('pincode', e.target.value)}
                    placeholder="e.g., 110001"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Landmark</label>
                  <input
                    className="form-input"
                    value={form.landmark}
                    onChange={(e) => update('landmark', e.target.value)}
                    placeholder="Nearby landmark"
                  />
                </div>
              </div>
              <MapPicker
                lat={form.latitude}
                lng={form.longitude}
                onChange={handleMapChange}
              />
            </div>

            <div className="card fade-in stagger-2">
              <div className="card-title">
                <span className="icon-wrap">
                  <IconAlert size={18} />
                </span>
                Incident Details
              </div>
              <div className="form-group">
                <label className="form-label">
                  Incident Type <span className="required">*</span>
                </label>
                <select
                  className="form-select"
                  value={form.incidentType}
                  onChange={(e) => update('incidentType', e.target.value)}
                >
                  {INCIDENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {errors.incidentType && (
                  <div className="form-error">{errors.incidentType}</div>
                )}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Water Depth (Optional)</label>
                  <div className="depth-row">
                    <input
                      className="form-input"
                      type="number"
                      step="0.1"
                      min="0"
                      value={form.waterDepth}
                      onChange={(e) => update('waterDepth', e.target.value)}
                      placeholder="Depth"
                    />
                    <select
                      className="form-select"
                      value={form.depthUnit}
                      onChange={(e) => update('depthUnit', e.target.value)}
                    >
                      <option value="cm">cm</option>
                      <option value="feet">feet</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    Severity Level <span className="required">*</span>
                  </label>
                  <div className="severity-grid">
                    {SEVERITIES.map((s) => (
                      <button
                        type="button"
                        key={s}
                        className={`severity-btn ${
                          form.severity === s ? `active-${s}` : ''
                        }`}
                        onClick={() => update('severity', s)}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-textarea"
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                  rows={4}
                  placeholder="Brief description of the flooding situation..."
                />
              </div>
            </div>

            <div className="card fade-in stagger-3">
              <div className="card-title">
                <span className="icon-wrap">
                  <IconCamera size={18} />
                </span>
                Media Upload
                <span className="required">*</span>
              </div>
              <MediaUpload
                photos={photos}
                videos={videos}
                onPhotosChange={setPhotos}
                onVideosChange={setVideos}
              />
              {errors.media && (
                <div className="form-error" style={{ marginTop: 8 }}>
                  {errors.media}
                </div>
              )}
            </div>

            <div className="card fade-in">
              <label className="consent-box">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>
                  I consent to the use of this information for flood assessment, early
                  warning systems, and research purposes. I understand that my report may
                  be shared with relevant authorities and emergency services.{' '}
                  <span className="required">*</span>
                </span>
              </label>
              {errors.consent && (
                <div className="form-error" style={{ marginTop: 8 }}>
                  {errors.consent}
                </div>
              )}
            </div>

            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? (
                <>
                  <span className="spinner"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <IconCloudUpload size={20} />
                  Submit Flood Report
                </>
              )}
            </button>
            <p className="form-footer-note">
              Your progress is automatically saved. You can safely close this page and
              return later.
            </p>
          </form>

          <div className="privacy-notice fade-in">
            <div className="icon-wrap">
              <IconShield size={20} />
            </div>
            <div>
              <h4>Privacy &amp; Data Usage</h4>
              <p>
                Your submission will be used solely for flood monitoring, emergency
                response, and urban planning. Personal information (if provided) will be
                kept confidential.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
