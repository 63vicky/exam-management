const Paper = require('../models/Paper');

// Create new paper
exports.createPaper = async (req, res) => {
  try {
    const {
      name,
      startDate,
      endDate,
      totalQuestions,
      duration,
      questionMode,
      status,
      ...otherFields
    } = req.body;

    // Validate required fields
    if (!name || !startDate || !endDate || !duration || !questionMode) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Convert date strings to Date objects
    const formattedStartDate = new Date(startDate);
    const formattedEndDate = new Date(endDate);

    // Validate dates
    if (isNaN(formattedStartDate.getTime()) || isNaN(formattedEndDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    if (formattedEndDate <= formattedStartDate) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const paperData = {
      name,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      totalQuestions: totalQuestions || 0,
      duration,
      questionMode,
      status: status || 'Active',
      ...otherFields,
      createdBy: req.user._id
    };

    const paper = new Paper(paperData);
    await paper.save();
    res.status(201).json(paper);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all papers
exports.getAllPapers = async (req, res) => {
  try {
    const papers = await Paper.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(papers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get paper by ID
exports.getPaperById = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id)
      .populate('createdBy', 'name email');
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }
    res.json(paper);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update paper
exports.updatePaper = async (req, res) => {
  try {
    const {
      name,
      startDate,
      endDate,
      totalQuestions,
      duration,
      questionMode,
      status,
      ...otherFields
    } = req.body;

    const paper = await Paper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    // Update fields if provided
    if (name) paper.name = name;
    if (startDate) paper.startDate = new Date(startDate);
    if (endDate) paper.endDate = new Date(endDate);
    if (totalQuestions !== undefined) paper.totalQuestions = totalQuestions;
    if (duration) paper.duration = duration;
    if (questionMode) paper.questionMode = questionMode;
    if (status) paper.status = status;

    // Update other fields
    Object.assign(paper, otherFields);

    await paper.save();
    res.json(paper);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete paper
exports.deletePaper = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }
    await paper.remove();
    res.json({ message: 'Paper deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update paper status
exports.updatePaperStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['Active', 'Deactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const paper = await Paper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    paper.status = status;
    await paper.save();
    res.json(paper);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 