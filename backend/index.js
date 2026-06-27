require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static assets
// e.g. http://localhost:8000/uploads/filename.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/reports', require('./routes/reports'));

// Health check
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Flood Report API is running' });
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
