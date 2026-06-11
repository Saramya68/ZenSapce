const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const auth = require('../middleware/auth');

// @route   GET api/tasks
// @desc    Get all user tasks
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

// @route   POST api/tasks
// @desc    Create a new task
// @access  Private
router.post('/', auth, async (req, res) => {
  const { title, description, status, priority, category } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ msg: 'Title is required' });
    }

    const newTask = new Task({
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      category: category || 'Work',
      user: req.user.id
    });

    const task = await newTask.save();
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

// @route   PUT api/tasks/:id
// @desc    Update a task
// @access  Private
router.put('/:id', auth, async (req, res) => {
  const { title, description, status, priority, category } = req.body;

  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    // Make sure user owns the task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // Build update object
    const taskFields = {};
    if (title !== undefined) taskFields.title = title;
    if (description !== undefined) taskFields.description = description;
    if (status !== undefined) taskFields.status = status;
    if (priority !== undefined) taskFields.priority = priority;
    if (category !== undefined) taskFields.category = category;

    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: taskFields },
      { new: true }
    );

    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

// @route   DELETE api/tasks/:id
// @desc    Delete a task
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    // Make sure user owns the task
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Task removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

module.exports = router;
