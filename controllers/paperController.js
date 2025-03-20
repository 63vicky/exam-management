const Paper = require('../models/Paper');

// Create new paper
exports.createPaper = async (req, res) => {
  try {
    const {
      name,
      type,
      passingPercentage,
      defaultMarks,
      negativeMarks,
      duration,
      maxTabSwitch,
      startDate,
      endDate,
      instructions,
      questionAddMethod,
      viewCorrectAnswers,
      emailNotify,
      directLogin,
      randomQuestions,
      randomOptions,
      proctored,
      showResult,
      customExeOnly,
      fileUpload,
      userGroups,
      status
    } = req.body;
    
    // Validate required fields
    if (!name || !type || 
        passingPercentage === undefined || passingPercentage === null || passingPercentage === '' ||
        defaultMarks === undefined || defaultMarks === null || defaultMarks === '' ||
        negativeMarks === undefined || negativeMarks === null || negativeMarks === '' ||
        duration === undefined || duration === null || duration === '' ||
        maxTabSwitch === undefined || maxTabSwitch === null || maxTabSwitch === '' ||
        !startDate || !endDate || !questionAddMethod) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Validate paper type
    if (!['exam', 'quiz', 'test', 'assignment', 'mid-term', 'final'].includes(type)) {
      return res.status(400).json({ message: 'Invalid paper type' });
    }

    // Validate question add method
    if (!['automatic', 'manual'].includes(questionAddMethod)) {
      return res.status(400).json({ message: 'Invalid question add method' });
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
      type,
      passingPercentage,
      defaultMarks,
      negativeMarks,
      duration,
      maxTabSwitch,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      instructions: instructions || '',
      questionAddMethod,
      viewCorrectAnswers: viewCorrectAnswers || false,
      emailNotify: emailNotify || false,
      directLogin: directLogin || false,
      randomQuestions: randomQuestions || false,
      randomOptions: randomOptions || false,
      proctored: proctored || false,
      showResult: showResult || false,
      customExeOnly: customExeOnly || false,
      fileUpload: fileUpload || false,
      userGroups: userGroups || [],
      status: status || 'Active',
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
    
    // Add totalQuestions field to each paper
    const papersWithCount = papers.map(paper => {
      const paperObj = paper.toObject();
      paperObj.totalQuestions = paper.questions ? paper.questions.length : 0;
      return paperObj;
    });

    res.json(papersWithCount);
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
    await paper.deleteOne();
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

// Add questions to paper
exports.addQuestionsToPaper = async (req, res) => {
  try {
    const { questions } = req.body;
    const paperId = req.params.id;

    const paper = await Paper.findById(paperId);
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    // Add questions to paper
    if (!paper.questions) {
      paper.questions = [];
    }
    paper.questions = [...paper.questions, ...questions];
    
    await paper.save();
    res.json(paper);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get paper questions
exports.getPaperQuestions = async (req, res) => {
  try {
    const paperId = req.params.id;
    const paper = await Paper.findById(paperId).populate('questions');
    
    if (!paper) {
      return res.status(404).json({ message: 'Paper not found' });
    }

    res.json(paper.questions || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 