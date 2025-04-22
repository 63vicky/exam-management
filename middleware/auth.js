const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Not authorized to access this route" });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
      next();
    } catch (err) {
      return res
        .status(401)
        .json({ message: "Not authorized to access this route" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

// Middleware to check if user has specific permission
exports.checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user.hasPermission(permission)) {
        return res.status(403).json({
          message: `User does not have permission to perform this action`,
        });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: "Error checking permissions" });
    }
  };
};

// Middleware to check if user has any of the specified permissions
exports.checkAnyPermission = (...permissions) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user.hasAnyPermission(permissions)) {
        return res.status(403).json({
          message: `User does not have permission to perform this action`,
        });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: "Error checking permissions" });
    }
  };
};

// Middleware to check if user has all specified permissions
exports.checkAllPermissions = (...permissions) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user.hasAllPermissions(permissions)) {
        return res.status(403).json({
          message: `User does not have permission to perform this action`,
        });
      }
      next();
    } catch (error) {
      res.status(500).json({ message: "Error checking permissions" });
    }
  };
};
