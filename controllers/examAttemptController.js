const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Question = require('../models/Question');

// Start a new exam attempt
exports.startExamAttempt = async (req, res) => {
  try {
    const { examId } = req.params;
    const userId = req.user._id;

    // Check if exam exists and is active
    const exam = await Exam.findOne({
      _id: examId,
      status: 'published',
      startDate: { $lte: new Date() },
      endDate: { $gte: new Date() },
    });

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found or not active' });
    }

    // Get user's previous attempts
    const previousAttempts = await Result.find({
      examId,
      userId,
    }).sort({ attemptNumber: -1 });

    const nextAttemptNumber = previousAttempts.length + 1;

    // Check if user has reached max attempts
    if (nextAttemptNumber > exam.maxAttempts) {
      return res.status(400).json({ message: 'Maximum attempts reached' });
    }

    // Get random questions for this attempt
    const randomQuestions = await Question.aggregate([
      { $match: { _id: { $in: exam.questions } } },
      { $sample: { size: exam.questions.length } },
    ]);

    // Create new result entry
    const result = await Result.create({
      examId,
      userId,
      attemptNumber: nextAttemptNumber,
      startTime: new Date(),
      endTime: new Date(Date.now() + exam.timeLimit * 60000), // Convert minutes to milliseconds
      answers: randomQuestions.map((q) => ({
        questionId: q._id,
        selectedAnswer: null,
        isCorrect: false,
        marks: 0,
      })),
      totalMarks: exam.totalMarks,
      obtainedMarks: 0,
      percentage: 0,
      isPassed: false,
      rating: 'Failed',
      status: 'in-progress',
    });

    res.json({
      resultId: result._id,
      questions: randomQuestions,
      timeLimit: exam.timeLimit,
      endTime: result.endTime,
    });
  } catch (error) {
    console.error('Error starting exam attempt:', error);
    res.status(500).json({ message: 'Error starting exam attempt' });
  }
};

// Submit exam attempt
exports.submitExamAttempt = async (req, res) => {
  try {
    const { resultId } = req.params;
    const { answers } = req.body;

    const result = await Result.findById(resultId)
      .populate('examId')
      .populate('answers.questionId');

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    if (result.status !== 'in-progress') {
      return res
        .status(400)
        .json({ message: 'Exam attempt already submitted' });
    }

    // Check if time is up
    if (new Date() > result.endTime) {
      result.status = 'timeout';
      await result.save();
      return res.status(400).json({ message: 'Time limit exceeded' });
    }

    // Calculate marks and update answers
    let obtainedMarks = 0;
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      const question = result.answers[i].questionId;
      let isCorrect = false;
      let marks = 0;

      if (
        question.questionType === 'multiple-choice-single' ||
        question.questionType === 'multiple-choice-multiple'
      ) {
        const correctOptions = question.options.filter((opt) => opt.isCorrect);
        isCorrect =
          JSON.stringify(answer) ===
          JSON.stringify(correctOptions.map((opt) => opt.text));
      } else if (question.questionType === 'true-false') {
        isCorrect = answer === question.answer;
      } else {
        // For short answer and essay, we'll need manual grading
        isCorrect = false;
      }

      if (isCorrect) {
        marks = question.marks;
        obtainedMarks += marks;
      }

      result.answers[i].selectedAnswer = answer;
      result.answers[i].isCorrect = isCorrect;
      result.answers[i].marks = marks;
    }

    // Calculate percentage and rating
    const percentage = (obtainedMarks / result.totalMarks) * 100;
    const isPassed =
      percentage >= (result.examId.passingMarks / result.totalMarks) * 100;

    let rating;
    if (percentage >= 90) rating = 'Excellent';
    else if (percentage >= 80) rating = 'Good';
    else if (percentage >= 60) rating = 'Average';
    else if (percentage >= 40) rating = 'Poor';
    else rating = 'Failed';

    // Update result
    result.obtainedMarks = obtainedMarks;
    result.percentage = percentage;
    result.isPassed = isPassed;
    result.rating = rating;
    result.status = 'completed';
    result.endTime = new Date();

    await result.save();

    res.json({
      message: 'Exam submitted successfully',
      result: {
        obtainedMarks,
        totalMarks: result.totalMarks,
        percentage,
        isPassed,
        rating,
      },
    });
  } catch (error) {
    console.error('Error submitting exam attempt:', error);
    res.status(500).json({ message: 'Error submitting exam attempt' });
  }
};

// Get user's best result for an exam
exports.getBestResult = async (req, res) => {
  try {
    const { examId, userId } = req.params;

    const bestResult = await Result.findOne({
      examId,
      userId,
      status: 'completed',
    }).sort({ percentage: -1 });

    if (!bestResult) {
      return res.status(404).json({ message: 'No completed attempts found' });
    }

    res.json(bestResult);
  } catch (error) {
    console.error('Error getting best result:', error);
    res.status(500).json({ message: 'Error getting best result' });
  }
};

// Get all attempts for a user in an exam
exports.getUserAttempts = async (req, res) => {
  try {
    const { examId, userId } = req.params;

    const attempts = await Result.find({
      examId,
      userId,
    }).sort({ attemptNumber: 1 });

    res.json(attempts);
  } catch (error) {
    console.error('Error getting user attempts:', error);
    res.status(500).json({ message: 'Error getting user attempts' });
  }
};
