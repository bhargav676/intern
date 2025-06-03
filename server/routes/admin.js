const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); 
const User = require('../models/User');
const UserSensorData = require('../models/UserSensorData');
const Device = require('../models/Device');
const authMiddleware = require('../middleware/auth');


const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};


router.get('/devices', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const devices = await Device.find(); 
    res.status(200).json(devices); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/user-sensor-data/:userId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).select('username');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch all sensor data for the user, sorted by timestamp (newest first)
    const sensorData = await UserSensorData.find({ userId }).sort({ timestamp: -1 });

    res.status(200).json({
      username: user.username,
      sensorData: sensorData.length > 0 ? sensorData : [], // Return all records, or an empty array if none exist
    });
  } catch (err) {
    console.error('Error fetching user sensor data:', err);
    res.status(500).json({ message: 'Server error: Unable to fetch user sensor data' });
  }
});

router.get('/user-sensor-data', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const data = await UserSensorData.find().populate('userId', 'username');
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, role });
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;