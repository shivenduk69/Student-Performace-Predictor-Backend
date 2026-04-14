const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  rollNo: {
    type: String,
    required: true,
    unique: true,
  },
  course: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  section: {
    type: String,
    required: true,
  },
  performance: {
    computerNetworks: {
      subject: {
        type: String,
        default: 'Computer Networks',
      },
      attendance: [{
        date: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          enum: ['Present', 'Absent'],
          required: true,
        },
      }],
      assignments: [{
        unit: {
          type: String,
          required: true,
        },
        marks: {
          type: mongoose.Schema.Types.Mixed, // Can be number or "Not Attempted"
          required: true,
        },
      }],
      midsem: {
        type: Number,
        min: 0,
        max: 50,
      },
      endsem: {
        type: Number,
        min: 0,
        max: 100,
      },
    },
  },
  complaints: [{
    date: {
      type: String,
    },
    complaint: {
      type: String,
    },
    actionTaken: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved'],
      default: 'In Progress',
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Student', studentSchema);
