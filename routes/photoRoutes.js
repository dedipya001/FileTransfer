const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const photoController = require('../controllers/photoController');

// Configure storage for uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/locationPhotos');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const { locationId, date, month, year } = req.body;
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
    const uniqueId = uuidv4().substring(0, 8);
    const extension = path.extname(file.originalname);
    cb(null, `location_${locationId}_${dateStr}_${uniqueId}${extension}`);
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const isMimeValid = allowedTypes.test(file.mimetype);
  
  if (isValid && isMimeValid) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG and GIF files are allowed.'), false);
  }
};

// Initialize multer upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Routes
router.get('/location/:locationId', photoController.getPhotosByLocation);
router.get('/date/:year/:month/:date', photoController.getPhotosByDate);
router.get('/stats/location/:locationId', photoController.getPhotoStatsForLocation);
router.post('/upload', upload.array('photos', 5), photoController.uploadPhotos);

module.exports = router;
