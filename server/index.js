require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = 3000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const Habit = require('./models/Habit');

app.use(express.json());

app.get('/habits', async (req, res) => {
  const habits = await Habit.find();
  res.json(habits);
});

app.post('/habits', async (req, res) => {
  const newHabit = new Habit(req.body);
  await newHabit.save();
  res.json(newHabit);
});

app.get('/', (req, res) => {
  res.send('Habit Tracker backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});