const addBtn = document.getElementById('addBtn');
const habitInput = document.getElementById('habitInput');
const habitList = document.getElementById('habitList');

const API_URL = 'https://habit-tracker-api-400k.onrender.com/habits';

async function fetchHabits() {
  const res = await fetch(API_URL);
  const habits = await res.json();
  renderHabits(habits);
}

function renderHabits(habits) {
  habitList.innerHTML = '';

  habits.forEach(function(habit) {
    const li = document.createElement('li');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = habit.done;
    checkbox.addEventListener('change', function() {
      updateHabit(habit._id, checkbox.checked);
    });

    const span = document.createElement('span');
    span.textContent = habit.text + ' (Streak: ' + habit.streak + ')';
    span.style.textDecoration = habit.done ? 'line-through' : 'none';

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', function() {
      deleteHabit(habit._id);
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    habitList.appendChild(li);
  });
}

async function addHabit(text) {
  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: text, done: false, streak: 0, lastDoneDate: null })
  });
  fetchHabits();
}

async function updateHabit(id, done) {
  await fetch(API_URL + '/' + id, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ done: done })
  });
  fetchHabits();
}

async function deleteHabit(id) {
  await fetch(API_URL + '/' + id, { method: 'DELETE' });
  fetchHabits();
}

addBtn.addEventListener('click', function() {
  const habitText = habitInput.value.trim();
  if (habitText === '') return;

  addHabit(habitText);
  habitInput.value = '';
});

fetchHabits();