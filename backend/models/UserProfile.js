// backend/models/UserProfile.js
const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    preferredSubjects: {
      type: [String],
      default: [],
      enum: ['Math', 'Science', 'English', 'History', 'Programming', 'General'],
    },
    avatar: {
      type: String,
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserProfile', userProfileSchema);
