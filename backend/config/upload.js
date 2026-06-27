const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const ALLOWED_IMAGE_MIMES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_MIMES = ['video/mp4', 'video/avi', 'video/quicktime', 'video/mov', 'video/x-msvideo'];
const ALLOWED_EXTENSIONS = /\.(jpeg|jpg|png|gif|webp|mp4|avi|mov)$/i;

const fileFilter = (req, file, cb) => {
  const extValid = ALLOWED_EXTENSIONS.test(path.extname(file.originalname));
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
