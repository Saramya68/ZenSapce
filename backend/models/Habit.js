const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Array of dates when completed, formatted as 'YYYY-MM-DD'
  completedDates: {
    type: [String],
    default: []
  },
  streak: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Habit', HabitSchema);
