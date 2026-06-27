const Report = require('../models/Report');
const { parseFloatOrNull, deleteCloudinaryResource, getISTTimestamp } = require('../utils/helpers');

// POST /api/reports
const createReport = async (req, res, next) => {
  try {
    console.log('[createReport] body:', req.body);
    console.log('[createReport] files:', req.files);

    // Extract Cloudinary URLs from uploaded files
    const photoUrls = (req.files?.photos || []).map((f) => f.path || f.secure_url);
    const videoUrls = (req.files?.videos || []).map((f) => f.path || f.secure_url);

    const reportData = {
      fullName: req.body.fullName,
      city: req.body.city,
      wardZone: req.body.wardZone || '',
      locality: req.body.locality,
      pincode: req.body.pincode || '',
      landmark: req.body.landmark || '',
      address: req.body.address || '',
      latitude: parseFloatOrNull(req.body.latitude),
      longitude: parseFloatOrNull(req.body.longitude),
      incidentType: req.body.incidentType,
      waterDepth: parseFloatOrNull(req.body.waterDepth),
      depthUnit: req.body.depthUnit || 'cm',
      severity: req.body.severity,
      description: req.body.description || '',
      remarks: req.body.remarks || '',
      photoUrls,
      videoUrls,
      createdAtIST: getISTTimestamp(),
    };

    const report = await Report.create(reportData);
    res.status(201).json({ success: true, report });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports
const getAllReports = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.severity) query.severity = req.query.severity;

    const reports = await Report.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, reports });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/:id
const getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    res.status(200).json({ success: true, report });
  } catch (err) {
    next(err);
  }
};

// PUT /api/reports/:id
const updateReport = async (req, res, next) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    res.status(200).json({ success: true, report });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/reports/:id
const deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    // Delete files from Cloudinary
    [...(report.photoUrls || []), ...(report.videoUrls || [])].forEach((url) => {
      deleteCloudinaryResource(url);
    });

    res.status(200).json({ success: true, message: 'Report deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createReport, getAllReports, getReportById, updateReport, deleteReport };
