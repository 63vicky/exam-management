const mongoose = require('mongoose');

const instituteSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  registrationLink: {
    type: String,
    required: true,
  },
  loginLink: {
    type: String,
    required: true,
  },
  licenseLimit: {
    type: String,
    required: true,
  },
  timezone: {
    type: String,
    required: true,
  },
  shortName: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  directorName: {
    type: String,
    default: 'NA',
  },
  address: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    default: 'NA',
  },
  pinCode: {
    type: String,
    required: true,
  },
  contactNumber: {
    type: String,
    required: true,
  },
  directorPicture: {
    type: String,
    default: null,
  },
  logo: {
    type: String,
    default: null,
  },
  about: {
    type: String,
    default: '',
  },
  services: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Institute', instituteSchema); 