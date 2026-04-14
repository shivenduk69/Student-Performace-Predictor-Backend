const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  mentorEmail: {
    type: String,
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  rollNo: {
    type: String,
    required: true,
  },
  feedbackText: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Feedback', feedbackSchema);
