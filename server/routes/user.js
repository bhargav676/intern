const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserSensorData = require('../models/UserSensorData');
const authMiddleware = require('../middleware/auth');
const sendEmail = require('../utils/sendEmail');
const { v4: uuidv4 } = require('uuid');

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).send('All fields are required');
    }
    if (password !== confirmPassword) {
      return res.status(400).send('Passwords do not match');
    }
    if (password.length < 6) {
      return res.status(400).send('Password must be at least 6 characters');
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).send('Invalid email format');
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).send('Username or email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const accessId = uuidv4();

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      accessId,
      role: 'user',
    });
    await newUser.save();

    const payload = { userId: newUser._id, role: newUser.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).send({
      message: 'Registered successfully',
      token,
      user: { username: newUser.username, email: newUser.email, accessId: newUser.accessId, role: newUser.role },
    });
  } catch (err) {
    console.error(err);
    if (err.code === 11000) {
      return res.status(400).send('Duplicate key error: username, email, or access ID already exists');
    }
    res.status(500).send('Server error: Unable to register user');
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const payload = { userId: user._id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { username: user.username, email: user.email, accessId: user.accessId, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error: Unable to login' });
  }
});

router.post('/sensor', async (req, res) => {
  try {
    const { ph, turbidity, tds, latitude, longitude, accessId } = req.body;
    if (!ph || !turbidity || !tds || !latitude || !longitude || !accessId) {
      return res.status(400).send('All fields are required');
    }

    const user = await User.findOne({ accessId });
    if (!user) {
      return res.status(401).send('Invalid access ID');
    }

    console.log('Received sensor data:', {
      userId: user._id,
      ph,
      turbidity,
      tds,
      latitude,
      longitude,
    });

    const sensorData = new UserSensorData({
      userId: user._id,
      ph,
      turbidity,
      tds,
      latitude,
      longitude,
    });
    await sensorData.save();

    const io = req.app.get('io');
    const sensorDataPayload = {
      userId: user._id.toString(),
      username: user.username,
      ph,
      turbidity,
      tds,
      latitude,
      longitude,
      timestamp: sensorData.timestamp,
    };

    if (ph > 8.0) {
      sensorDataPayload.alert = `High pH level detected: ${ph}`;
      sendEmail(
        user.email,
        'Water Quality Alert: High pH Level',
        `Warning: The pH level of your water is ${ph}, which exceeds the safe threshold of 8.0. Please take action.`
      ).catch((emailErr) => {
        console.error(`Failed to send email to ${user.email} for pH ${ph}:`, emailErr.message);
      });
    }

    io.emit('newSensorData', sensorDataPayload);
    io.emit('newUserSensorData', sensorDataPayload);

    res.status(200).send('Sensor data saved successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error: Unable to save sensor data');
  }
});

router.get('/sensor/data', authMiddleware, async (req, res) => {
  try {
    const data = await UserSensorData.find({ userId: req.user.userId });
    res.status(200).send(data);
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('username email role');
    if (!user) {
      return res.status(404).send('User not found');
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;