const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completedDates: { type: [String], default: [] }
});

module.exports = mongoose.model('Habit', habitSchema);