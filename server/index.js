require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const Habit = require('./models/Habit');

app.get('/habits', async (req, res) => {
  const habits = await Habit.find();
  res.json(habits);
});

app.post('/habits', async (req, res) => {
  const newHabit = new Habit({ text: req.body.text, completedDates: [] });
  await newHabit.save();
  res.json(newHabit);
});

app.put('/habits/:id/toggle', async (req, res) => {
  const { date } = req.body;
  const habit = await Habit.findById(req.params.id);
  if (!habit) return res.status(404).json({ message: 'Not found' });

  const idx = habit.completedDates.indexOf(date);
  if (idx === -1) {
    habit.completedDates.push(date);
  } else {
    habit.completedDates.splice(idx, 1);
  }
  await habit.save();
  res.json(habit);
});

app.delete('/habits/:id', async (req, res) => {
  await Habit.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

app.get('/', (req, res) => {
  res.send('Habit Tracker backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});