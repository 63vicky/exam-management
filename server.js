const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const userRoutes = require("./routes/users");
const examRoutes = require("./routes/exams");
const questionRoutes = require("./routes/questions");
const resultRoutes = require("./routes/results");
const statsRoutes = require("./routes/stats");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const paperRoutes = require("./routes/paperRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const groupRoutes = require("./routes/groups");
const instituteRoutes = require("./routes/institute");
const subAdminRoutes = require("./routes/subAdminRoutes");
const subAdminStatsRoutes = require("./routes/subAdminStatsRoutes");
const examAttemptRoutes = require("./routes/examAttemptRoutes");

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: [process.env.CLIENT_URL, "http://localhost:5173"],
    credentials: true,
  })
);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// API Routes - These should come BEFORE static file serving
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", userRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/papers", paperRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/institute", instituteRoutes);
app.use("/api/sub-admins", subAdminRoutes);
app.use("/api/sub-admin-stats", subAdminStatsRoutes);
app.use("/api/exam-attempts", examAttemptRoutes);

// Serve static files from the dist directory - This should come AFTER API routes
const distPath = path.join(__dirname, "dist");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(distPath));

// Handle client-side routing - this should be after all API routes and static file serving
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: "exam-management-system",
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Helper route to create a test user (for development purposes)
app.post("/api/auth/create-test-user", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create new user
    const newUser = new User({
      email,
      password,
    });

    await newUser.save();

    res.status(201).json({ message: "Test user created successfully" });
  } catch (error) {
    console.error("Error creating test user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Protected route example
app.get("/api/user", async (req, res) => {
  try {
    const token = req.header("x-auth-token");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
});

// Create initial institute record if it doesn't exist
app.post("/api/institute/init", async (req, res) => {
  try {
    const Institute = require("./models/Institute");
    const existingInstitute = await Institute.findOne();

    if (existingInstitute) {
      return res.status(400).json({ message: "Institute already exists" });
    }

    const initialInstitute = await Institute.create({
      email: "admin@example.com",
      registrationLink: "http://localhost:5173/register",
      loginLink: "http://localhost:5173/login",
      licenseLimit: "100",
      timezone: "Asia/Kolkata",
      shortName: "EMS",
      fullName: "Exam Management System",
      directorName: "Admin",
      address: "123 Main Street",
      district: "Sample District",
      state: "Sample State",
      pinCode: "123456",
      contactNumber: "1234567890",
      about: "Welcome to our Exam Management System",
      services: "Online Examination Services",
    });

    res.status(201).json(initialInstitute);
  } catch (error) {
    console.error("Error creating initial institute:", error);
    res
      .status(500)
      .json({
        message: "Error creating initial institute",
        error: error.message,
      });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
