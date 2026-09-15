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

      if (checkbox.checked) {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        if (habits[index].lastDoneDate === yesterday) {
          habits[index].streak += 1;
        } else if (habits[index].lastDoneDate !== today) {
          habits[index].streak = 1;
        }

        habits[index].lastDoneDate = today;
      } else {
        habits[index].streak = Math.max(0, habits[index].streak - 1);
      }

      saveHabits();
      renderHabits();
    });

    const span = document.createElement('span');
    span.textContent = habit.text + ' (Streak: ' + habit.streak + ')';
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

  habits.push({ text: habitText, done: false, streak: 0, lastDoneDate: null });
  saveHabits();
  renderHabits();
  habitInput.value = '';
});

renderHabits();