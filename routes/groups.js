const express = require('express');
const router = express.Router();
const Group = require('../models/Group');
const { protect, authorize } = require('../middleware/auth');

// Get all groups
router.get('/', protect, async (req, res) => {
  try {
    const groups = await Group.find({ status: 'Active' }).sort({ name: 1 });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching groups' });
  }
});

// Create new group (admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const group = await Group.create(req.body);
    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error creating group' });
  }
});

// Update group (admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const group = await Group.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Error updating group' });
  }
});

// Delete group (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const group = await Group.findByIdAndDelete(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting group' });
  }
});

module.exports = router;
