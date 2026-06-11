const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: 'Password must be at least 6 characters' });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User with this email already exists' });
    }

    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ msg: 'Username is already taken' });
    }

    user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Create JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, settings: user.settings } });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }

    // Check for user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const payload = {
      user: {
        id: user.id
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, settings: user.settings } });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

// @route   PUT api/auth/settings
// @desc    Update user settings
// @access  Private
router.put('/settings', auth, async (req, res) => {
  const { timerDuration, shortBreak, longBreak } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (timerDuration !== undefined) user.settings.timerDuration = timerDuration;
    if (shortBreak !== undefined) user.settings.shortBreak = shortBreak;
    if (longBreak !== undefined) user.settings.longBreak = longBreak;

    await user.save();
    res.json(user.settings);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
});

module.exports = router;
