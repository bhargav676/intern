const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  ph: {
    type: Number,
    required: true,
  },
  turbidity: {
    type: Number,
    required: true,
  },
  tds: {
    type: Number,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('UserSensorData', sensorDataSchema);