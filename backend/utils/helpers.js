const path = require('path');
const fs = require('fs');

/**
 * Returns current time as a human-readable IST string.
 * e.g. "27 Jun 2026, 12:13:49 AM IST"
 */
const getISTTimestamp = () => {
  return new Date().toLocaleString('en-IN', {
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

/**
 * Build a public URL for a stored file.
 * @param {string} filePath - The full path or filename saved by Multer
 * @returns {string} Public URL accessible via /uploads/<filename>
 */
const buildFileUrl = (filePath) => {
  const base = process.env.BASE_URL || 'http://localhost:8000';
  return `${base}/uploads/${path.basename(filePath)}`;
};

/**
 * Delete a file from disk if it exists.
 * @param {string} filePath - Absolute path to the file
 */
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error(`[deleteFile] Could not delete ${filePath}:`, err.message);
  }
};

/**
 * Safely parse a float, returning null if not a valid number.
 * @param {*} value
 * @returns {number|null}
 */
const parseFloatOrNull = (value) => {
  const n = parseFloat(value);
  return isNaN(n) ? null : n;
};

module.exports = { buildFileUrl, deleteFile, parseFloatOrNull, getISTTimestamp };
