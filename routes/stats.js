const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Result = require('../models/Result');

// Get all statistics (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const [
      totalUsers,
      totalExams,
      totalQuestions,
      totalResults,
      activeExams,
      usersByRole,
      examsBySubject,
    ] = await Promise.all([
      User.countDocuments(),
      Exam.countDocuments(),
      Question.countDocuments(),
      Result.countDocuments(),
      Exam.countDocuments({ status: 'published' }),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      Exam.aggregate([{ $group: { _id: '$subject', count: { $sum: 1 } } }]),
    ]);

    res.json({
      users: {
        total: totalUsers,
        byRole: usersByRole.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
      },
      exams: {
        total: totalExams,
        active: activeExams,
        bySubject: examsBySubject.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
      },
      questions: {
        total: totalQuestions,
      },
      results: {
        total: totalResults,
      },
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get detailed user statistics
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    const stats = {
      total: users.length,
      byRole: {
        admin: users.filter((u) => u.role === 'admin').length,
        teacher: users.filter((u) => u.role === 'teacher').length,
        student: users.filter((u) => u.role === 'student').length,
      },
      recentUsers: users
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5)
        .map((u) => ({
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
        })),
    };
    res.json(stats);
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get detailed exam statistics
router.get('/exams', protect, authorize('admin'), async (req, res) => {
  try {
    const exams = await Exam.find();
    const stats = {
      total: exams.length,
      byStatus: {
        draft: exams.filter((e) => e.status === 'draft').length,
        published: exams.filter((e) => e.status === 'published').length,
        completed: exams.filter((e) => e.status === 'completed').length,
      },
      bySubject: exams.reduce((acc, exam) => {
        acc[exam.subject] = (acc[exam.subject] || 0) + 1;
        return acc;
      }, {}),
      recentExams: exams
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5)
        .map((e) => ({
          id: e._id,
          title: e.title,
          subject: e.subject,
          status: e.status,
          createdAt: e.createdAt,
        })),
    };
    res.json(stats);
  } catch (error) {
    console.error('Error fetching exam statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get detailed question statistics
router.get('/questions', protect, authorize('admin'), async (req, res) => {
  try {
    const questions = await Question.find();
    const stats = {
      total: questions.length,
      byType: questions.reduce((acc, q) => {
        acc[q.type] = (acc[q.type] || 0) + 1;
        return acc;
      }, {}),
      byDifficulty: questions.reduce((acc, q) => {
        acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
        return acc;
      }, {}),
      recentQuestions: questions
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5)
        .map((q) => ({
          id: q._id,
          text: q.questionText,
          type: q.type,
          difficulty: q.difficulty,
          createdAt: q.createdAt,
        })),
    };
    res.json(stats);
  } catch (error) {
    console.error('Error fetching question statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get detailed result statistics
router.get('/results', protect, authorize('admin'), async (req, res) => {
  try {
    const results = await Result.find().populate('examId', 'title subject');
    const stats = {
      total: results.length,
      byExam: results.reduce((acc, r) => {
        acc[r.examId.title] = (acc[r.examId.title] || 0) + 1;
        return acc;
      }, {}),
      averageScore:
        results.reduce((acc, r) => acc + r.score, 0) / results.length,
      passRate:
        (results.filter((r) => r.score >= r.passingMarks).length /
          results.length) *
        100,
      recentResults: results
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 5)
        .map((r) => ({
          id: r._id,
          examTitle: r.examId.title,
          score: r.score,
          passingMarks: r.passingMarks,
          createdAt: r.createdAt,
        })),
    };
    res.json(stats);
  } catch (error) {
    console.error('Error fetching result statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
