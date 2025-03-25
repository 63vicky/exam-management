const mongoose = require('mongoose');
const User = require('../models/User');
const Exam = require('../models/Exam');
const Result = require('../models/Result');
const Group = require('../models/Group');
const Question = require('../models/Question');
const path = require('path');
require('dotenv').config();

const demoGroups = [
  {
    name: 'Class A',
    description: 'First batch of students',
    status: 'Active',
  },
  {
    name: 'Class B',
    description: 'Second batch of students',
    status: 'Active',
  },
  {
    name: 'Admin Group',
    description: 'Administrative staff',
    status: 'Active',
  },
];

const demoUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    mobile: '1234567890',
    role: 'student',
    status: 'Active',
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    mobile: '9876543210',
    role: 'student',
    status: 'Active',
  },
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    mobile: '5555555555',
    role: 'admin',
    status: 'Active',
  },
];

const demoExams = [
  {
    title: 'Mathematics Basic',
    description: 'Basic mathematics test covering arithmetic and algebra',
    subject: 'Mathematics',
    duration: 60,
    totalMarks: 100,
    passingMarks: 60,
    status: 'published',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Week from now
  },
  {
    title: 'English Grammar',
    description: 'Test your English grammar knowledge',
    subject: 'English',
    duration: 45,
    totalMarks: 50,
    passingMarks: 35,
    status: 'published',
    startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Day after tomorrow
    endTime: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
  },
  {
    title: 'Science Quiz',
    description: 'General science knowledge test',
    subject: 'Science',
    duration: 30,
    totalMarks: 75,
    passingMarks: 45,
    status: 'published',
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
  },
];

const generateDemoQuestions = (examId, createdBy) => {
  const questions = [];
  const questionCount = 10; // 10 questions per exam

  for (let i = 0; i < questionCount; i++) {
    questions.push({
      examId,
      questionText: `Sample question ${i + 1} for ${examId}`,
      questionType: 'multiple-choice-single',
      options: [
        { text: 'Option A', isCorrect: true },
        { text: 'Option B', isCorrect: false },
        { text: 'Option C', isCorrect: false },
        { text: 'Option D', isCorrect: false },
      ],
      marks: 10,
      mainCategory: 'General',
      subCategory: 'Basic',
      level: 'top-simple',
      status: 'Active',
      createdBy,
    });
  }

  return questions;
};

const generateDemoData = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('Attempting to connect to MongoDB...');
    console.log(
      'MongoDB URI:',
      mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//****:****@')
    );

    await mongoose.connect(mongoUri, {
      dbName: 'exam-management-system',
    });
    console.log('Successfully connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Exam.deleteMany({}),
      Result.deleteMany({}),
      Group.deleteMany({}),
      Question.deleteMany({}),
    ]);
    console.log('Successfully cleared existing data');

    // Create groups
    console.log('Creating demo groups...');
    const groups = await Group.create(demoGroups);
    console.log(`Successfully created ${groups.length} demo groups`);

    // Create users with group assignments
    console.log('Creating demo users...');
    const users = await User.create(
      demoUsers.map((user) => ({
        ...user,
        group:
          user.role === 'admin'
            ? groups.find((g) => g.name === 'Admin Group')._id
            : groups.find((g) => g.name === 'Class A')._id,
      }))
    );
    console.log(`Successfully created ${users.length} demo users`);

    // Create exams with admin user as creator
    console.log('Creating demo exams...');
    const adminUser = users.find((user) => user.role === 'admin');
    const exams = await Exam.create(
      demoExams.map((exam) => ({
        ...exam,
        createdBy: adminUser._id,
      }))
    );
    console.log(`Successfully created ${exams.length} demo exams`);

    // Create questions for each exam
    console.log('Creating demo questions...');
    const questions = [];
    for (const exam of exams) {
      const examQuestions = generateDemoQuestions(exam._id, adminUser._id);
      questions.push(...examQuestions);
    }
    const createdQuestions = await Question.create(questions);
    console.log(
      `Successfully created ${createdQuestions.length} demo questions`
    );

    // Generate results
    console.log('Generating demo results...');
    const students = users.filter((user) => user.role === 'student');
    const results = [];

    for (const student of students) {
      for (const exam of exams) {
        // Generate 2-3 attempts per student per exam
        const attempts = Math.floor(Math.random() * 2) + 2;

        for (let i = 0; i < attempts; i++) {
          // Get questions for this exam
          const examQuestions = createdQuestions.filter(
            (q) => q.examId.toString() === exam._id.toString()
          );

          const answers = examQuestions.map((question) => {
            const isCorrect = Math.random() > 0.4; // 60% chance of correct answer
            return {
              questionId: question._id,
              selectedOption: isCorrect ? 'A' : 'B',
              isCorrect,
              marks: question.marks,
            };
          });

          const totalMarks = answers.reduce((sum, ans) => sum + ans.marks, 0);
          const obtainedMarks = answers.reduce(
            (sum, ans) => sum + (ans.isCorrect ? ans.marks : 0),
            0
          );
          const percentage = (obtainedMarks / totalMarks) * 100;

          // Generate random time within last 30 days
          const endTime = new Date();
          endTime.setDate(endTime.getDate() - Math.floor(Math.random() * 30));
          const startTime = new Date(endTime);
          startTime.setHours(
            startTime.getHours() - Math.floor(Math.random() * 2) + 1
          );

          results.push({
            examId: exam._id,
            userId: student._id,
            answers,
            totalMarks,
            obtainedMarks,
            percentage: Number(percentage.toFixed(2)),
            isPassed: percentage >= (exam.passingMarks / exam.totalMarks) * 100,
            startTime,
            endTime,
          });
        }
      }
    }

    console.log('Inserting demo results...');
    await Result.create(results);
    console.log(`Successfully created ${results.length} demo results`);

    console.log('\nDemo data summary:');
    console.log(`- Groups: ${groups.length}`);
    console.log(
      `- Users: ${users.length} (${students.length} students, 1 admin)`
    );
    console.log(`- Exams: ${exams.length}`);
    console.log(`- Questions: ${createdQuestions.length}`);
    console.log(`- Results: ${results.length}`);
    console.log(
      `- Average attempts per student: ${(
        results.length / students.length
      ).toFixed(1)}`
    );

    // Close MongoDB connection
    console.log('\nClosing MongoDB connection...');
    await mongoose.connection.close();
    console.log('Successfully closed MongoDB connection');
  } catch (error) {
    console.error('Error generating demo data:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
};

// Run the script
console.log('Starting demo data generation...');
generateDemoData();
