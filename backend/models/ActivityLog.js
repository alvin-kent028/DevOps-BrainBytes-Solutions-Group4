// backend/models/ActivityLog.js
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserProfile',
      required: true,
    },
    subject: {
      type: String,
      default: 'General',
    },
    question: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      required: true,
    },
    questionType: {
      type: String,
      enum: ['definition', 'explanation', 'example', 'unknown'],
      default: 'unknown',
    },
    sentimentScore: {
      type: Number,
      default: 0, // -1 (frustrated) to 1 (positive)
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
