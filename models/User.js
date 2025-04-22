const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please provide an email"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please provide a valid email",
    ],
  },
  mobile: {
    type: String,
    required: [true, "Please provide a mobile number"],
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ["admin", "teacher", "student"],
    default: "student",
  },
  permissions: {
    type: Map,
    of: Boolean,
    default: function () {
      const defaultPermissions = {
        "exam:create": false,
        "exam:view": true,
        "exam:edit": false,
        "exam:delete": false,
        "question:create": false,
        "question:view": true,
        "question:edit": false,
        "question:delete": false,
        "user:create": false,
        "user:view": false,
        "user:edit": false,
        "user:delete": false,
        "stats:view": false,
        "group:view": false,
        "group:create": false,
        "group:edit": false,
        "group:delete": false,
        "subadmin:view": false,
        "subadmin:create": false,
        "subadmin:edit": false,
        "subadmin:delete": false,
        "result:view": true,
        "result:create": true,
      };

      // Set default permissions based on role
      if (this.role === "admin") {
        Object.keys(defaultPermissions).forEach((key) => {
          defaultPermissions[key] = true;
        });
      } else if (this.role === "teacher") {
        defaultPermissions["exam:create"] = true;
        defaultPermissions["exam:view"] = true;
        defaultPermissions["exam:edit"] = true;
        defaultPermissions["exam:delete"] = true;
        defaultPermissions["question:create"] = true;
        defaultPermissions["question:view"] = true;
        defaultPermissions["question:edit"] = true;
        defaultPermissions["question:delete"] = true;
        defaultPermissions["result:view"] = true;
        defaultPermissions["stats:view"] = true;
      }

      return defaultPermissions;
    },
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: [true, "Please provide a group"],
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to check if user has permission
userSchema.methods.hasPermission = function (permission) {
  return this.permissions.get(permission);
};

// Method to check if user has any of the given permissions
userSchema.methods.hasAnyPermission = function (permissions) {
  return permissions.some((permission) => this.permissions.get(permission));
};

// Method to check if user has all of the given permissions
userSchema.methods.hasAllPermissions = function (permissions) {
  return permissions.every((permission) => this.permissions.get(permission));
};

module.exports = mongoose.model("User", userSchema);
