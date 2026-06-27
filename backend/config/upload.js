const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'flood-reports',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov', 'avi'],
    public_id: (req, file) => {
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1e9);
      const ext = file.originalname.split('.').pop();
      return `flood-${timestamp}-${random}.${ext}`;
    },
  },
});

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/avi', 'video/quicktime', 'video/mov', 'video/x-msvideo'];
const ALLOWED_EXTENSIONS = /\.(jpeg|jpg|png|gif|webp|mp4|avi|mov)$/i;

const fileFilter = (req, file, cb) => {
  const extValid = ALLOWED_EXTENSIONS.test(file.originalname);
  const mimeValid =
    ALLOWED_IMAGE_MIMES.includes(file.mimetype) ||
    ALLOWED_VIDEO_MIMES.includes(file.mimetype);

  if (extValid && mimeValid) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB per file
  },
  fileFilter,
}).fields([
  { name: 'photos', maxCount: 5 },
  { name: 'videos', maxCount: 2 },
]);

module.exports = upload;
