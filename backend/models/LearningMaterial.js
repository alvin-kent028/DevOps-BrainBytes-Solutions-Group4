// backend/models/LearningMaterial.js
const mongoose = require('mongoose');

const learningMaterialSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      enum: ['Math', 'Science', 'English', 'History', 'Programming', 'General'],
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      enum: ['definition', 'explanation', 'example', 'summary'],
      default: 'explanation',
    },
    tags: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UserProfile',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LearningMaterial', learningMaterialSchema);
