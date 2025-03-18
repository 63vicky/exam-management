const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');
const { protect, authorize } = require('../middleware/auth');

// Get all exams
router.get('/', protect, async (req, res) => {
  try {
    const exams = await Exam.find().populate('createdBy', 'name email');
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exams' });
  }
});

// Get single exam
router.get('/:id', protect, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }
    res.json(exam);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exam' });
  }
});

// Create exam (teachers and admins only)
router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const exam = await Exam.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ message: 'Error creating exam' });
  }
});

// Update exam (teachers and admins only)
router.put('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check if user is the creator or admin
    if (
      exam.createdBy.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res
        .status(403)
        .json({ message: 'Not authorized to update this exam' });
    }

    const updatedExam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.json(updatedExam);
  } catch (error) {
    res.status(500).json({ message: 'Error updating exam' });
  }
});

// Delete exam (teachers and admins only)
router.delete(
  '/:id',
  protect,
  authorize('teacher', 'admin'),
  async (req, res) => {
    try {
      const exam = await Exam.findById(req.params.id);
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found' });
      }

      // Check if user is the creator or admin
      if (
        exam.createdBy.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin'
      ) {
        return res
          .status(403)
          .json({ message: 'Not authorized to delete this exam' });
      }

      await exam.remove();
      res.json({ message: 'Exam deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting exam' });
    }
  }
);

// Get exams by teacher
router.get('/teacher/:teacherId', protect, async (req, res) => {
  try {
    const exams = await Exam.find({ createdBy: req.params.teacherId }).populate(
      'createdBy',
      'name email'
    );
    res.json(exams);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching teacher exams' });
  }
});

module.exports = router;
