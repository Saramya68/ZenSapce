const mongoose = require('mongoose');

const FocusSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  duration: {
    type: Number,
    required: true // duration in minutes (e.g. 25)
  },
  category: {
    type: String,
    enum: ['Coding', 'Design', 'Planning', 'Learning', 'Review', 'Other'],
    default: 'Coding'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FocusSession', FocusSessionSchema);
