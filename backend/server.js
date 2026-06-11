const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const path = require('path');
// Load environment variables relative to server.js
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/zenspace';
mongoose
  .connect(MONGO_URI, {
    serverSelectionTimeoutMS: 3000 // Fail fast (3s) if MongoDB is not running
  })
  .then(() => console.log('MongoDB connection established successfully!'))
  .catch((err) => {
    console.error('MongoDB connection error details:', err.message);
    console.log('Ensure MongoDB is running on your machine (e.g. net start MongoDB).');
  });

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/habits', require('./routes/habits'));
app.use('/api/analytics', require('./routes/analytics'));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Serve static assets in production (optional, could be extended later)
app.get('/', (req, res) => {
  res.send('ZenSpace API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
