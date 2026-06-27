import React, { useRef, useState, useEffect, useCallback } from 'react';
import { IconCamera, IconImage, IconVideo, IconX } from './Icons';

export default function MediaUpload({ photos, videos, onPhotosChange, onVideosChange }) {
  const photoRef = useRef(null);
  const videoRef = useRef(null);

  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');

  const streamRef = useRef(null);
  const videoElRef = useRef(null);
  const canvasRef = useRef(null);

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files).slice(0, 5 - photos.length);
    const newPhotos = files.map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    onPhotosChange([...photos, ...newPhotos].slice(0, 5));
    e.target.value = '';
  };

  const handleVideos = (e) => {
    const files = Array.from(e.target.files).slice(0, 2 - videos.length);
    const newVids = files.map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    onVideosChange([...videos, ...newVids].slice(0, 2));
    e.target.value = '';
  };

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const closeCamera = useCallback(() => {
    stopStream();
    setShowCamera(false);
    setCameraReady(false);
    setCameraError('');
  }, [stopStream]);

  const openCamera = async () => {
    if (photos.length >= 5) {
      alert('Maximum 5 photos already added.');
      return;
    }
    setCameraError('');
    setCameraReady(false);
    setShowCamera(true);
  };

  const attachVideoRef = useCallback(
    async (el) => {
      videoElRef.current = el;
      if (!el || !showCamera) return;

      if (streamRef.current) {
        el.srcObject = streamRef.current;
        return;
      }

      try {
        const constraints = {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        el.srcObject = stream;
        el.onloadedmetadata = () => {
          el.play().catch(() => {});
        };
      } catch (err) {
        let msg = 'Camera access denied.';
        if (err.name === 'NotFoundError') msg = 'No camera found on this device.';
        else if (err.name === 'NotAllowedError') msg = 'Camera permission denied. Please allow camera access.';
        else if (err.name === 'NotReadableError') msg = 'Camera is in use by another app.';
        setCameraError(msg);
      }
    },
    [showCamera]
  );

  const handleVideoPlaying = () => setCameraReady(true);

  const capturePhoto = () => {
    const video = videoElRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const w = video.videoWidth;
    const h = video.videoHeight;

    if (!w || !h) {
      alert('Camera is not ready yet. Please wait a moment and try again.');
      return;
    }

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, w, h);

    canvas.toBlob(
      (blob) => {
        if (!blob || blob.size < 100) {
          alert('Capture failed — frame was empty. Please try again.');
          return;
        }
        const filename = `camera-${Date.now()}.jpg`;
        const file = new File([blob], filename, { type: 'image/jpeg' });
        const preview = URL.createObjectURL(file);
        onPhotosChange([...photos, { file, preview }].slice(0, 5));
        closeCamera();
      },
      'image/jpeg',
      0.92
    );
  };

  useEffect(() => {
    return () => stopStream();
  }, [stopStream]);

  const removePhoto = (i) => {
    const arr = [...photos];
    URL.revokeObjectURL(arr[i].preview);
    arr.splice(i, 1);
    onPhotosChange(arr);
  };

  const removeVideo = (i) => {
    const arr = [...videos];
    URL.revokeObjectURL(arr[i].preview);
    arr.splice(i, 1);
    onVideosChange(arr);
  };

  const formatSize = (bytes) => (bytes / 1024 / 1024).toFixed(1) + ' MB';

  return (
    <div className="upload-grid">
      <div>
        <label className="form-label">
          Photos ({photos.length}/5)
        </label>
        <div className="upload-actions">
          <div className="upload-zone" onClick={() => photoRef.current.click()}>
            <div className="icon-wrap">
              <IconImage size={24} />
            </div>
            <div className="title">Upload Photos</div>
            <div className="hint">Max 5 files · JPG / PNG</div>
          </div>
          <div
            className="upload-zone"
            onClick={openCamera}
            style={{ opacity: photos.length >= 5 ? 0.5 : 1 }}
          >
            <div className="icon-wrap">
              <IconCamera size={24} />
            </div>
            <div className="title">Take Photo</div>
            <div className="hint">Use live camera</div>
          </div>
        </div>

        <input
          ref={photoRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={handlePhotos}
        />

        {photos.length > 0 && (
          <div className="preview-grid">
            {photos.map((p, i) => (
              <div key={i} className="preview-item">
                <img src={p.preview} alt={`Photo ${i + 1}`} />
                <button
                  type="button"
                  className="preview-remove"
                  onClick={() => removePhoto(i)}
                  aria-label={`Remove photo ${i + 1}`}
                >
                  <IconX size={14} />
                </button>
                <span className="preview-size">{formatSize(p.file.size)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="form-label">
          Videos ({videos.length}/2)
        </label>
        <div className="upload-zone" onClick={() => videoRef.current.click()}>
          <div className="icon-wrap">
            <IconVideo size={24} />
          </div>
          <div className="title">Upload Videos</div>
          <div className="hint">Max 2 files · 50 MB each</div>
        </div>
        <input
          ref={videoRef}
          type="file"
          accept="video/*"
          multiple
          hidden
          onChange={handleVideos}
        />
        {videos.length > 0 && (
          <div className="preview-grid">
            {videos.map((v, i) => (
              <div key={i} className="preview-item">
                <video src={v.preview} controls />
                <button
                  type="button"
                  className="preview-remove"
                  onClick={() => removeVideo(i)}
                  aria-label={`Remove video ${i + 1}`}
                >
                  <IconX size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCamera && (
        <div className="camera-modal-overlay">
          {cameraError ? (
            <div className="camera-error-state">
              <div className="camera-error-icon">📵</div>
              <p style={{ marginBottom: 24, lineHeight: 1.6 }}>{cameraError}</p>
              <button onClick={closeCamera} className="btn btn-danger">
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="camera-video-container">
                <video
                  ref={attachVideoRef}
                  autoPlay
                  playsInline
                  muted
                  onPlaying={handleVideoPlaying}
                />
                {!cameraReady && (
                  <div className="camera-loading-overlay">
                    <span className="spinner spinner-dark" style={{ width: 36, height: 36, borderWidth: 3 }} />
                    <span style={{ fontSize: '.9rem' }}>Starting camera…</span>
                  </div>
                )}
              </div>

              <div className="camera-controls">
                <button onClick={closeCamera} className="btn btn-danger">
                  <IconX size={18} />
                  Cancel
                </button>
                <button
                  onClick={capturePhoto}
                  disabled={!cameraReady}
                  className="btn btn-success"
                >
                  <IconCamera size={18} />
                  Capture
                </button>
              </div>

              <p className="camera-hint">Tap Capture to take photo</p>
            </>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}
    </div>
  );
}
