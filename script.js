const addBtn = document.getElementById('addBtn');
const habitInput = document.getElementById('habitInput');
const habitList = document.getElementById('habitList');

let habits = JSON.parse(localStorage.getItem('habits')) || [];

function saveHabits() {
  localStorage.setItem('habits', JSON.stringify(habits));
}

function renderHabits() {
  habitList.innerHTML = '';

  habits.forEach(function(habit, index) {
    const li = document.createElement('li');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = habit.done;
    checkbox.addEventListener('change', function() {
      habits[index].done = checkbox.checked;
      saveHabits();
      renderHabits();
    });

    const span = document.createElement('span');
    span.textContent = habit.text;
    span.style.textDecoration = habit.done ? 'line-through' : 'none';

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', function() {
      habits.splice(index, 1);
      saveHabits();
      renderHabits();
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    habitList.appendChild(li);
  });
}

addBtn.addEventListener('click', function() {
  const habitText = habitInput.value.trim();

  if (habitText === '') {
    return;
  }

  habits.push({ text: habitText, done: false });
  saveHabits();
  renderHabits();
  habitInput.value = '';
});

renderHabits();