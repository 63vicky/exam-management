const Institute = require('../models/Institute');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Base URL for uploaded files
const BASE_URL = process.env.BASE_URL || 'https://exam-management-ua2o.onrender.com';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload an image.'), false);
    }
  }
});

// Get institute details
exports.getInstitute = async (req, res) => {
  try {
    const institute = await Institute.findOne();
    if (!institute) {
      return res.status(404).json({ message: 'Institute not found' });
    }
    res.json(institute);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching institute details', error: error.message });
  }
};

// Create or update institute details
exports.updateInstitute = async (req, res) => {
  try {
    const instituteData = req.body;
    
    // Try to find existing institute
    let institute = await Institute.findOne();
    
    if (institute) {
      // Update existing institute
      institute = await Institute.findOneAndUpdate(
        { _id: institute._id },
        instituteData,
        { new: true, runValidators: true }
      );
    } else {
      // Create new institute
      institute = await Institute.create(instituteData);
    }
    
    res.json(institute);
  } catch (error) {
    res.status(500).json({ message: 'Error updating institute details', error: error.message });
  }
};

// Delete institute
exports.deleteInstitute = async (req, res) => {
  try {
    const institute = await Institute.findOneAndDelete();
    if (!institute) {
      return res.status(404).json({ message: 'Institute not found' });
    }
    res.json({ message: 'Institute deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting institute', error: error.message });
  }
};

// Upload logo
exports.uploadLogo = [
  upload.single('logo'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const institute = await Institute.findOne();
      if (!institute) {
        return res.status(404).json({ message: 'Institute not found' });
      }

      // Delete old logo if it exists
      if (institute.logo) {
        const oldLogoPath = path.join(uploadsDir, path.basename(institute.logo));
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      }

      // Update with new logo path with complete URL
      const fileUrl = `${BASE_URL}/uploads/${req.file.filename}`;
      institute.logo = fileUrl;
      await institute.save();

      res.json({ 
        url: fileUrl,
        message: 'Logo uploaded successfully'
      });
    } catch (error) {
      res.status(500).json({ message: 'Error uploading logo', error: error.message });
    }
  }
];

// Upload director picture
exports.uploadDirectorPicture = [
  upload.single('directorPicture'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const institute = await Institute.findOne();
      if (!institute) {
        return res.status(404).json({ message: 'Institute not found' });
      }

      // Delete old director picture if it exists
      if (institute.directorPicture) {
        const oldPicturePath = path.join(uploadsDir, path.basename(institute.directorPicture));
        if (fs.existsSync(oldPicturePath)) {
          fs.unlinkSync(oldPicturePath);
        }
      }

      // Update with new director picture path with complete URL
      const fileUrl = `${BASE_URL}/uploads/${req.file.filename}`;
      institute.directorPicture = fileUrl;
      await institute.save();

      res.json({ 
        url: fileUrl,
        message: 'Director picture uploaded successfully'
      });
    } catch (error) {
      res.status(500).json({ message: 'Error uploading director picture', error: error.message });
    }
  }
]; 