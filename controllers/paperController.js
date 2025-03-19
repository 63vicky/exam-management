const Paper = require('../models/Paper');

// Create new paper
exports.createPaper = async (req, res) => {
  try {
    const paperData = {
      ...req.body,
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
    const papers = await Paper.find().populate('createdBy', 'name email');
    res.json(papers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get paper by ID
exports.getPaperById = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id).populate('createdBy', 'name email');
    if (!paper) {
      return res.status(404).json({ message: 'पेपर नहीं मिला' });
    }
    res.json(paper);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update paper
exports.updatePaper = async (req, res) => {
  try {
    const paper = await Paper.findById(req.params.id);
    if (!paper) {
      return res.status(404).json({ message: 'पेपर नहीं मिला' });
    }
    Object.assign(paper, req.body);
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
      return res.status(404).json({ message: 'पेपर नहीं मिला' });
    }
    await paper.remove();
    res.json({ message: 'पेपर सफलतापूर्वक हटा दिया गया' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 