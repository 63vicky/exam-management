const mongoose = require('mongoose');
const Result = require('../models/Result');
const Exam = require('../models/Exam');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const generateRandomAnswers = (questionCount) => {
  const answers = [];
  for (let i = 0; i < questionCount; i++) {
    const isCorrect = Math.random() > 0.5; // 50% chance of correct answer
    answers.push({
      questionId: new mongoose.Types.ObjectId(), // Random question ID
      selectedOption: isCorrect ? 'A' : 'B',
      isCorrect,
      marks: Math.floor(Math.random() * 5) + 1, // Random marks between 1-5
    });
  }
  return answers;
};

const generateDemoResults = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Get all exams
    const exams = await Exam.find({}, '_id');
    if (exams.length === 0) {
      console.log('No exams found. Please create some exams first.');
      return;
    }

    // Get all users
    const users = await User.find({}, '_id');
    if (users.length === 0) {
      console.log('No users found. Please create some users first.');
      return;
    }

    // Generate 50 random results
    const results = [];
    for (let i = 0; i < 50; i++) {
      const examId = exams[Math.floor(Math.random() * exams.length)]._id;
      const userId = users[Math.floor(Math.random() * users.length)]._id;

      // Generate random question count between 10-20
      const questionCount = Math.floor(Math.random() * 11) + 10;
      const answers = generateRandomAnswers(questionCount);

      // Calculate marks
      const totalMarks = answers.reduce((sum, ans) => sum + ans.marks, 0);
      const obtainedMarks = answers.reduce(
        (sum, ans) => sum + (ans.isCorrect ? ans.marks : 0),
        0
      );
      const percentage = (obtainedMarks / totalMarks) * 100;

      // Get the exam to check its passing marks
      const exam = await Exam.findById(examId);
      if (!exam) {
        console.log(`Exam ${examId} not found, skipping result`);
        continue;
      }

      // Set pass threshold based on exam's passing marks
      const isPassed =
        percentage >= (exam.passingMarks / exam.totalMarks) * 100;

      // Generate random time within last 30 days
      const endTime = new Date();
      endTime.setDate(endTime.getDate() - Math.floor(Math.random() * 30));
      const startTime = new Date(endTime);
      startTime.setHours(
        startTime.getHours() - Math.floor(Math.random() * 3) + 1
      ); // 1-3 hours duration

      results.push({
        examId,
        userId,
        answers,
        totalMarks,
        obtainedMarks,
        percentage: Number(percentage.toFixed(2)),
        isPassed,
        startTime,
        endTime,
      });
    }

    // Insert all results
    await Result.insertMany(results);
    console.log(`Successfully generated ${results.length} demo results`);

    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error generating demo results:', error);
    process.exit(1);
  }
};

// Run the script
generateDemoResults();
