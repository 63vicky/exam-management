const SubAdmin = require('../models/subAdmin');
const bcrypt = require('bcryptjs');

// Get all sub-admins
exports.getAllSubAdmins = async (req, res) => {
  try {
    const subAdmins = await SubAdmin.find().select('-password');
    res.json(subAdmins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single sub-admin
exports.getSubAdmin = async (req, res) => {
  try {
    const subAdmin = await SubAdmin.findById(req.params.id).select('-password');
    if (!subAdmin) {
      return res.status(404).json({ message: 'Sub-admin not found' });
    }
    res.json(subAdmin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create sub-admin
exports.createSubAdmin = async (req, res) => {
  try {
    const { firstName, lastName, mobile, email, password, groups } = req.body;

    // Check if email already exists
    const existingSubAdmin = await SubAdmin.findOne({ email });
    if (existingSubAdmin) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const subAdmin = new SubAdmin({
      firstName,
      lastName,
      mobile,
      email,
      password: hashedPassword,
      groups
    });

    const newSubAdmin = await subAdmin.save();
    res.status(201).json(newSubAdmin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update sub-admin
exports.updateSubAdmin = async (req, res) => {
  try {
    const { firstName, lastName, mobile, email, groups, status } = req.body;
    const updateData = { firstName, lastName, mobile, email, groups, status };

    // If password is provided, hash it
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(req.body.password, salt);
    }

    const subAdmin = await SubAdmin.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!subAdmin) {
      return res.status(404).json({ message: 'Sub-admin not found' });
    }
    res.json(subAdmin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete sub-admin
exports.deleteSubAdmin = async (req, res) => {
  try {
    const subAdmin = await SubAdmin.findByIdAndDelete(req.params.id);
    if (!subAdmin) {
      return res.status(404).json({ message: 'Sub-admin not found' });
    }
    res.json({ message: 'Sub-admin deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 