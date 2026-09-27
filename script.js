const API_URL = 'http://localhost:3000/habits';

const habitInput = document.getElementById('habitInput');
const addBtn = document.getElementById('addBtn');
const habitList = document.getElementById('habitList');
const calSelect = document.getElementById('calHabitSelect');
const inputError = document.getElementById('inputError');
const toast = document.getElementById('toast');
const themeToggle = document.getElementById('themeToggle');

let habits = [];
let calMonthOffset = 0;

function todayStr(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + (offsetDays || 0));
  return d.toISOString().slice(0, 10);
}
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 1800);
}
function getStreak(habit) {
  let streak = 0, i = 0;
  while (habit.completedDates.includes(todayStr(-i))) { streak++; i++; }
  return streak;
}

async function fetchHabits() {
  const res = await fetch(API_URL);
  habits = await res.json();
  renderAll();
}

async function addHabit(text) {
  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  showToast('Habit added');
  fetchHabits();
}

async function toggleHabit(id, date) {
  await fetch(API_URL + '/' + id + '/toggle', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date })
  });
  fetchHabits();
}

async function deleteHabit(id) {
  await fetch(API_URL + '/' + id, { method: 'DELETE' });
  showToast('Habit deleted');
  fetchHabits();
}

function renderHabitList() {
  habitList.innerHTML = '';
  if (habits.length === 0) {
    const p = document.createElement('p'); p.className = 'empty'; p.textContent = 'No habits yet — add one above.';
    habitList.appendChild(p); return;
  }
  habits.forEach(h => {
    const done = h.completedDates.includes(todayStr());
    const li = document.createElement('li');
    const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = done;
    cb.addEventListener('change', () => {
      toggleHabit(h._id, todayStr());
      showToast(cb.checked ? 'Nice — marked done for today' : 'Unmarked');
    });
    const span = document.createElement('span');
    span.className = 'habit-text' + (done ? ' done' : '');
    span.textContent = h.text;
    const badge = document.createElement('span');
    badge.className = 'badge'; badge.textContent = 'Streak: ' + getStreak(h);
    const del = document.createElement('button'); del.className = 'del'; del.textContent = 'Delete';
    del.addEventListener('click', () => {
      if (confirm('Delete "' + h.text + '"? This removes its whole history too.')) deleteHabit(h._id);
    });
    li.append(cb, span, badge, del);
    habitList.appendChild(li);
  });
}

function renderStats() {
  const best = Math.max(0, ...habits.map(getStreak));
  document.getElementById('statBest').textContent = best;

  const daysElapsed = new Date().getDate();
  const possible = habits.length * daysElapsed;
  let doneCount = 0;
  habits.forEach(h => h.completedDates.forEach(d => { if (d.slice(0,7) === todayStr().slice(0,7)) doneCount++; }));
  const rate = possible > 0 ? Math.round((doneCount / possible) * 100) : 0;
  document.getElementById('statRate').textContent = rate + '%';
  const circumference = 169.6;
  document.getElementById('ringProgress').style.strokeDashoffset = circumference - (Math.min(rate,100)/100) * circumference;

  const allDays = new Set();
  habits.forEach(h => h.completedDates.forEach(d => allDays.add(d)));
  document.getElementById('statTotal').textContent = allDays.size;
}

function renderCalendarSelect() {
  const prevVal = calSelect.value;
  calSelect.innerHTML = '';
  habits.forEach(h => {
    const opt = document.createElement('option'); opt.value = h._id; opt.textContent = h.text;
    calSelect.appendChild(opt);
  });
  if (habits.some(h => h._id === prevVal)) calSelect.value = prevVal;
}

function renderCalendar() {
  const grid = document.getElementById('calGrid');
  grid.innerHTML = '';
  const habit = habits.find(h => h._id === calSelect.value) || habits[0];
  const dayLabels = ['S','M','T','W','T','F','S'];
  dayLabels.forEach(d => {
    const el = document.createElement('div'); el.className = 'cal-day-label'; el.textContent = d;
    grid.appendChild(el);
  });
  const base = new Date();
  const viewDate = new Date(base.getFullYear(), base.getMonth() + calMonthOffset, 1);
  document.getElementById('calMonthLabel').textContent = viewDate.toLocaleString('default', { month: 'short', year: 'numeric' });
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 0).getDate();
  const dates = habit ? habit.completedDates : [];
  for (let i = 0; i < firstDay; i++) {
    const b = document.createElement('div'); b.className = 'cal-cell blank'; grid.appendChild(b);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = new Date(viewDate.getFullYear(), viewDate.getMonth(), d).toISOString().slice(0,10);
    const cell = document.createElement('div');
    let cls = 'cal-cell';
    if (dates.includes(dateStr)) cls += ' done';
    if (dateStr === todayStr()) cls += ' today';
    cell.className = cls;
    cell.textContent = d;
    grid.appendChild(cell);
  }
}

function renderGraph() {
  const graph = document.getElementById('graph');
  graph.innerHTML = '';
  const labels = []; const counts = [];
  for (let i = 6; i >= 0; i--) {
    const dateStr = todayStr(-i);
    labels.push(['S','M','T','W','T','F','S'][new Date(dateStr).getDay()]);
    counts.push(habits.filter(h => h.completedDates.includes(dateStr)).length);
  }
  const max = Math.max(1, ...counts);
  counts.forEach((val, i) => {
    const col = document.createElement('div'); col.className = 'bar-col';
    const bar = document.createElement('div'); bar.className = 'bar';
    bar.style.height = (val / max * 90) + 'px';
    const label = document.createElement('div'); label.className = 'bar-label'; label.textContent = labels[i];
    col.append(bar, label);
    graph.appendChild(col);
  });
}

function renderHistory() {
  const list = document.getElementById('historyList');
  list.innerHTML = '';
  const entries = [];
  habits.forEach(h => h.completedDates.slice().sort().reverse().slice(0,5).forEach(d => entries.push({ date: d, text: h.text })));
  entries.sort((a,b) => b.date.localeCompare(a.date));
  if (!entries.length) {
    const p = document.createElement('p'); p.className = 'empty'; p.textContent = 'No activity yet — check off a habit.';
    list.appendChild(p); return;
  }
  entries.slice(0,8).forEach(e => {
    const row = document.createElement('div'); row.className = 'history-row';
    row.innerHTML = '<span>' + e.date + ' — ' + e.text + '</span><span class="ok">Done</span>';
    list.appendChild(row);
  });
}

function renderAll() {
  renderHabitList();
  renderCalendarSelect();
  renderCalendar();
  renderStats();
  renderGraph();
  renderHistory();
}

addBtn.addEventListener('click', () => {
  const t = habitInput.value.trim();
  inputError.textContent = '';
  if (!t) return;
  if (habits.some(h => h.text.toLowerCase() === t.toLowerCase())) {
    inputError.textContent = 'You already have a habit with that name.'; return;
  }
  addHabit(t);
  habitInput.value = '';
});
habitInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addBtn.click(); });
habitInput.addEventListener('input', () => { inputError.textContent = ''; });
calSelect.addEventListener('change', renderCalendar);
document.getElementById('calPrev').addEventListener('click', () => { calMonthOffset--; renderCalendar(); });
document.getElementById('calNext').addEventListener('click', () => { calMonthOffset = Math.min(0, calMonthOffset + 1); renderCalendar(); });

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '🌙' : '🌞';
  localStorage.setItem('theme', theme);
}
themeToggle.addEventListener('click', () => {
  const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  applyTheme(cur === 'dark' ? 'light' : 'dark');
});
applyTheme(localStorage.getItem('theme') || 'light');

const quotes = [
  "Small steps every day lead to big changes.",
  "Discipline is choosing what you want most over what you want now.",
  "Consistency beats intensity."
];
document.getElementById('quote').textContent = quotes[Math.floor(Math.random()*quotes.length)];

fetchHabits();