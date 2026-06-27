const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
 * Delete a resource from Cloudinary using its URL.
 * @param {string} url - Cloudinary URL of the resource to delete
 */
const deleteCloudinaryResource = async (url) => {
  try {
    if (!url) return;
    
    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/public_id.ext
    const urlParts = url.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex === -1) return;
    
    const publicIdWithVersion = urlParts.slice(uploadIndex + 1).join('/');
    const publicId = publicIdWithVersion.replace(/v\d+\//, '').replace(/\.[^.]+$/, '');
    
    // Determine resource type from URL
    const resourceType = url.includes('/video/') ? 'video' : 'image';
    
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    console.log(`[deleteCloudinaryResource] Deleted: ${publicId}`);
  } catch (err) {
    console.error(`[deleteCloudinaryResource] Could not delete ${url}:`, err.message);
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

module.exports = { deleteCloudinaryResource, parseFloatOrNull, getISTTimestamp };
