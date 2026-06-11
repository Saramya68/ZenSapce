const express = require('express');
const router = express.Router();
const Habit = require('../models/Habit');
const auth = require('../middleware/auth');

// Helper to format date as YYYY-MM-DD
function formatDate(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to calculate current streak
function calculateStreak(completedDates) {
  if (!completedDates || completedDates.length === 0) return 0;

  // Remove duplicates and sort descending (lexicographical sorting works perfectly for YYYY-MM-DD)
  const uniqueDates = [...new Set(completedDates)].sort().reverse();

  const todayStr = formatDate(new Date());
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDate(yesterday);

  // If the most recent completed date is not today and not yesterday, streak is 0
  const latest = uniqueDates[0];
  if (latest !== todayStr && latest !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  
  // Parse YYYY-MM-DD in local time to prevent timezone offset bugs
  const [year, month, day] = latest.split('-').map(Number);
  let checkDate = new Date(year, month - 1, day);

  // Walk backwards to find consecutive days
  while (true) {
    const checkStr = formatDate(checkDate);
    if (uniqueDates.includes(checkStr)) {
      streak++;
      // Move checkDate back by 1 day
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

// @route   GET api/habits
// @desc    Get all user habits
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(habits);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

// @route   POST api/habits
// @desc    Create a new habit
// @access  Private
router.post('/', auth, async (req, res) => {
  const { title } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ msg: 'Title is required' });
    }

    const newHabit = new Habit({
      title,
      user: req.user.id
    });

    const habit = await newHabit.save();
    res.json(habit);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

// @route   PUT api/habits/:id/toggle
// @desc    Toggle habit completion status for a specific date
// @access  Private
router.put('/:id/toggle', auth, async (req, res) => {
  const { date } = req.body; // Expect date in 'YYYY-MM-DD' format

  try {
    if (!date) {
      return res.status(400).json({ msg: 'Date is required' });
    }

    const habit = await Habit.findById(req.params.id);
    if (!habit) {
      return res.status(404).json({ msg: 'Habit not found' });
    }

    if (habit.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const index = habit.completedDates.indexOf(date);
    if (index > -1) {
      // Date exists, remove it (untoggle)
      habit.completedDates.splice(index, 1);
    } else {
      // Date doesn't exist, add it (toggle complete)
      habit.completedDates.push(date);
    }

    // Recalculate streak
    habit.streak = calculateStreak(habit.completedDates);

    await habit.save();
    res.json(habit);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

// @route   DELETE api/habits/:id
// @desc    Delete a habit
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    if (!habit) {
      return res.status(404).json({ msg: 'Habit not found' });
    }

    if (habit.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Habit.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Habit removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

module.exports = router;
