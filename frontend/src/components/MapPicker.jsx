import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IconMapPin, IconExternalLink } from './Icons';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapPicker({ lat, lng, onChange }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [gpsFixed, setGpsFixed] = useState(false);
  const [formattedAddress, setFormattedAddress] = useState('');
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    if (mapInstance.current) return;

    const initLat = lat || 28.6139;
    const initLng = lng || 77.209;

    const map = L.map(mapRef.current).setView([initLat, initLng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    const marker = L.marker([initLat, initLng], { draggable: true }).addTo(map);

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      handleLocationUpdate(pos.lat, pos.lng, false);
    });

    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      handleLocationUpdate(e.latlng.lat, e.latlng.lng, false);
    });

    mapInstance.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const reverseGeocode = async (newLat, newLng) => {
    setGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${newLat}&lon=${newLng}&format=json&addressdetails=1`
      );
      const data = await res.json();
      return data.display_name || '';
    } catch {
      return '';
    } finally {
      setGeocoding(false);
    }
  };

  const handleLocationUpdate = async (newLat, newLng, isGPS) => {
    if (isGPS) setGpsFixed(true);

    const addr = await reverseGeocode(newLat, newLng);
    setFormattedAddress(addr);
    onChange(newLat, newLng, addr);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lt, longitude: lg } = pos.coords;
        markerRef.current.setLatLng([lt, lg]);
        mapInstance.current.setView([lt, lg], 16);
        await handleLocationUpdate(lt, lg, true);
        setLoading(false);
      },
      () => {
        alert('Unable to get location. Please enable location services.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const openInGoogleMaps = () => {
    const currentLat = (lat || 28.6139).toFixed(6);
    const currentLng = (lng || 77.209).toFixed(6);
    window.open(
      `https://www.google.com/maps?q=${currentLat},${currentLng}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className="form-group">
      <label className="form-label">
        Location on Map <span className="required">*</span>
      </label>

      <div className="map-actions">
        <button
          type="button"
          className="gps-btn"
          onClick={getCurrentLocation}
          disabled={loading}
        >
          {loading ? (
            <span className="spinner"></span>
          ) : (
            <IconMapPin size={18} />
          )}
          Use Current Location
        </button>

        <button
          type="button"
          className="btn btn-google"
          onClick={openInGoogleMaps}
          disabled={!gpsFixed}
          title={
            gpsFixed
              ? 'Open current location in Google Maps'
              : 'Use Current Location first to enable this button'
          }
        >
          <IconExternalLink size={16} />
          Open in Google Maps
        </button>
      </div>

      <div className="map-wrapper">
        <div ref={mapRef} className="map-container"></div>
      </div>

      <div className="location-card">
        <div className="location-card-row">
          <strong>Coordinates</strong>
          <span className="mono">
            {(lat || 28.6139).toFixed(6)}, {(lng || 77.209).toFixed(6)}
          </span>
        </div>
        <div className="location-card-row">
          <strong>Address</strong>
          <span>
            {geocoding
              ? 'Fetching address…'
              : formattedAddress || 'Move the pin or use GPS to get address'}
          </span>
        </div>
      </div>
    </div>
  );
}
