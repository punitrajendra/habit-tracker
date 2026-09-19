const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  text: { type: String, required: true },
  done: { type: Boolean, default: false },
  streak: { type: Number, default: 0 },
  lastDoneDate: { type: String, default: null }
});

module.exports = mongoose.model('Habit', habitSchema);