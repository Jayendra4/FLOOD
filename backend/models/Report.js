const mongoose = require('mongoose');
const path = require('path');

const reportSchema = new mongoose.Schema(
  {
    // Personal info
    fullName: { type: String, required: true, trim: true },

    // Location
    city: { type: String, required: true, trim: true },
    wardZone: { type: String, trim: true, default: '' },
    locality: { type: String, required: true, trim: true },
    pincode: { type: String, trim: true, default: '' },
    landmark: { type: String, trim: true, default: '' },
    address: { type: String, trim: true, default: '' },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },

    // Incident details
    incidentType: { type: String, required: true },
    waterDepth: { type: Number, default: null },
    depthUnit: { type: String, default: 'cm', enum: ['cm', 'feet'] },
    severity: {
      type: String,
      required: true,
      enum: ['low', 'moderate', 'high', 'critical'],
    },
    description: { type: String, trim: true, default: '' },
    remarks: { type: String, trim: true, default: '' },

    // Media — store only the filename (e.g. "1234567890-987654321.jpg")
    photoPaths: [{ type: String }],
    videoPaths: [{ type: String }],

    // Admin-managed status
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved'],
      default: 'pending',
    },

    // IST timestamp stored explicitly for display in MongoDB Atlas
    createdAtIST: { type: String, default: '' },
  },
  { timestamps: true }
);

// Virtual: build full public URLs from stored filenames
reportSchema.virtual('photoUrls').get(function () {
  const base = process.env.BASE_URL || 'http://localhost:8000';
  return (this.photoPaths || []).map((p) => `${base}/uploads/${path.basename(p)}`);
});

reportSchema.virtual('videoUrls').get(function () {
  const base = process.env.BASE_URL || 'http://localhost:8000';
  return (this.videoPaths || []).map((p) => `${base}/uploads/${path.basename(p)}`);
});

reportSchema.set('toJSON', { virtuals: true });
reportSchema.set('toObject', { virtuals: true });

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
