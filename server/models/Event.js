const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  coachId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  traineesId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
  maximum: {type: Number, default: 0 },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  status: { type: String, enum: ['confirmed', 'canceled', 'pending'], default: 'pending' },
  isGroup: {type: Boolean, default: false},
  created_at: { type: Date, default: Date.now },
  updateBy: {type: String, required: true},
});

module.exports = mongoose.model('Event', EventSchema);
