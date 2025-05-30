const express = require('express');
const router = express.Router();
const Device = require('../models/Device');
const AdminSensorData = require('../models/AdminSensorData');
const UserSensorData = require('../models/UserSensorData');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admins only' });
  }
  next();
};

router.post('/sensor-data', async (req, res) => {
  try {
    const { deviceId, ph, turbidity, tds, latitude, longitude } = req.body;
    if (!deviceId || !ph || !turbidity || !tds || !latitude || !longitude) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    await Device.findOneAndUpdate(
      { deviceId },
      {
        deviceId,
        name: `Water Monitor ${deviceId}`,
        location: { type: 'Point', coordinates: [longitude, latitude] },
      },
      { upsert: true }
    );

    const sensorData = new AdminSensorData({ deviceId, ph, turbidity, tds });
    await sensorData.save();

    const io = req.app.get('io');
    io.emit('newAdminSensorData', { deviceId, ph, turbidity, tds, timestamp: sensorData.timestamp });

    res.status(201).json({ message: 'Data saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/devices', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const devices = await Device.find();
    res.status(200).json(devices);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/sensor-data/:deviceId', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const sensorData = await AdminSensorData.find({ deviceId }).sort({ timestamp: -1 }).limit(10);
    res.status(200).json(sensorData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/user-sensor-data', authMiddleware, async (req, res) => {
  try {
    const userSensorData = await UserSensorData.find()
      .populate('userId', 'username email')
      .sort({ timestamp: -1 });
    res.status(200).json(userSensorData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;