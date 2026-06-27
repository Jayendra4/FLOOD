const mongoose = require('mongoose');

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

    // Media — store Cloudinary URLs directly
    photoUrls: [{ type: String }],
    videoUrls: [{ type: String }],

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

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
