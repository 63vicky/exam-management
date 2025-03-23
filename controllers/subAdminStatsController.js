const SubAdminStats = require('../models/subAdminStats');
const Question = require('../models/Question');
const Paper = require('../models/Paper');

// Get stats for a specific sub-admin
exports.getSubAdminStats = async (req, res) => {
  try {
    const { subAdminId } = req.params;

    // Get questions stats
    const questionsStats = await Question.aggregate([
      { $match: { createdBy: subAdminId } },
      {
        $group: {
          _id: null,
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          deactive: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
          total: { $sum: 1 }
        }
      }
    ]);

    // Get papers stats
    const papersStats = await Paper.aggregate([
      { $match: { createdBy: subAdminId } },
      {
        $group: {
          _id: null,
          active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          deactive: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
          total: { $sum: 1 }
        }
      }
    ]);

    // Format stats
    const stats = {
      questions: questionsStats[0] || { active: 0, deactive: 0, total: 0 },
      papers: papersStats[0] || { active: 0, deactive: 0, total: 0 }
    };

    // Update or create stats in database
    await SubAdminStats.findOneAndUpdate(
      { subAdminId },
      {
        questions: stats.questions,
        papers: stats.papers
      },
      { upsert: true, new: true }
    );

    res.json(stats);
  } catch (error) {
    console.error('Error getting sub-admin stats:', error);
    res.status(500).json({ message: 'Error getting sub-admin stats' });
  }
};

// Update stats for a sub-admin
exports.updateSubAdminStats = async (req, res) => {
  try {
    const { subAdminId } = req.params;
    const stats = await SubAdminStats.findOneAndUpdate(
      { subAdminId },
      req.body,
      { new: true, upsert: true }
    );
    res.json(stats);
  } catch (error) {
    console.error('Error updating sub-admin stats:', error);
    res.status(500).json({ message: 'Error updating sub-admin stats' });
  }
}; 