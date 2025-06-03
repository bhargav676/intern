const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: { type: [Number], required: true }, 
  },
  createdAt: { type: Date, default: Date.now },
});

deviceSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('Device', deviceSchema);