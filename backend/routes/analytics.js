const express = require('express');
const router = express.Router();
const FocusSession = require('../models/FocusSession');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// @route   POST api/analytics/focus
// @desc    Log a completed focus session
// @access  Private
router.post('/focus', auth, async (req, res) => {
  const { duration, category } = req.body;

  try {
    if (!duration) {
      return res.status(400).json({ msg: 'Duration is required' });
    }

    const newSession = new FocusSession({
      duration,
      category: category || 'Coding',
      user: req.user.id
    });

    const session = await newSession.save();
    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

// @route   GET api/analytics/stats
// @desc    Get dashboard analytics stats (last 7 days focus, task completions)
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    // 1. Get total focus sessions & minutes
    const sessions = await FocusSession.find({ user: req.user.id });
    const totalMinutes = sessions.reduce((acc, curr) => acc + curr.duration, 0);
    const totalSessions = sessions.length;

    // 2. Focus categories breakdown
    const categoryStats = {
      Coding: 0,
      Design: 0,
      Planning: 0,
      Learning: 0,
      Review: 0,
      Other: 0
    };
    
    sessions.forEach(s => {
      if (categoryStats[s.category] !== undefined) {
        categoryStats[s.category] += s.duration;
      } else {
        categoryStats[s.category] = s.duration;
      }
    });

    // 3. Last 7 days focus history
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      last7Days.push({
        dateStr: `${year}-${month}-${day}`,
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        minutes: 0
      });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentSessions = await FocusSession.find({
      user: req.user.id,
      createdAt: { $gte: sevenDaysAgo }
    });

    recentSessions.forEach(s => {
      const sDate = new Date(s.createdAt);
      const year = sDate.getFullYear();
      const month = String(sDate.getMonth() + 1).padStart(2, '0');
      const day = String(sDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const dayObj = last7Days.find(d => d.dateStr === dateStr);
      if (dayObj) {
        dayObj.minutes += s.duration;
      }
    });

    // 4. Task status breakdown
    const tasks = await Task.find({ user: req.user.id });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const pendingTasks = totalTasks - completedTasks;

    const taskPriorityStats = { low: 0, medium: 0, high: 0 };
    tasks.forEach(t => {
      if (taskPriorityStats[t.priority] !== undefined) {
        taskPriorityStats[t.priority]++;
      }
    });

    res.json({
      totalMinutes,
      totalSessions,
      categoryStats,
      focusHistory: last7Days,
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        priority: taskPriorityStats
      }
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

module.exports = router;
