const app = document.querySelector('#app');

let tasks = [];
let filter = 'all'; // all | active | completed

app.innerHTML = `
  <main style="font-family: system-ui; max-width: 720px; margin: 40px auto; padding: 0 16px;">
    <h1 data-testid="app-title">Mini Taskboard</h1>

    <section style="border: 1px solid #ddd; padding: 16px; border-radius: 8px;">
      <h2 style="margin-top: 0;">Nueva tarea</h2>

      <div style="display:flex; gap: 8px; align-items:center;">
        <input
          data-testid="task-input"
          type="text"
          placeholder="Escribe una tarea..."
          style="flex: 1; padding: 8px;"
        />
        <button data-testid="add-task" type="button">Añadir</button>
      </div>

      <p data-testid="task-error" style="display:none; color:#b00020; margin: 10px 0 0;">
        La tarea no puede estar vacía
      </p>
    </section>

    <section style="margin-top: 16px; border: 1px solid #ddd; padding: 16px; border-radius: 8px;">
      <h2 style="margin-top: 0;">Lista</h2>

      <div style="display:flex; gap: 8px; align-items:center; flex-wrap: wrap;">
        <button data-testid="filter-all" type="button">Todas</button>
        <button data-testid="filter-active" type="button">Activas</button>
        <button data-testid="filter-completed" type="button">Completadas</button>

        <span style="margin-left:auto;">
          Pendientes: <strong data-testid="pending-count">0</strong>
        </span>
      </div>

      <ul data-testid="task-list" style="list-style:none; padding-left: 0; margin: 12px 0 0;"></ul>
      <p data-testid="empty-state" style="display:none; color:#555; margin: 12px 0 0;">
        No hay tareas para mostrar
      </p>
    </section>
  </main>
`;

function createTask(text) {
  return {
    id: crypto.randomUUID(),
    text,
    done: false,
  };
}

function getVisibleTasks() {
  if (filter === 'active') return tasks.filter((t) => !t.done);
  if (filter === 'completed') return tasks.filter((t) => t.done);
  return tasks;
}

function render() {
  const list = app.querySelector('[data-testid="task-list"]');
  const empty = app.querySelector('[data-testid="empty-state"]');
  const pending = app.querySelector('[data-testid="pending-count"]');

  const visible = getVisibleTasks();
  list.innerHTML = '';

  for (const t of visible) {
    const li = document.createElement('li');
    li.setAttribute('data-testid', 'task-item');
    li.setAttribute('data-task-id', t.id);
    li.style.display = 'flex';
    li.style.gap = '10px';
    li.style.alignItems = 'center';
    li.style.padding = '8px 0';
    li.style.borderBottom = '1px solid #eee';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = t.done;
    checkbox.setAttribute('data-testid', 'task-toggle');

    const label = document.createElement('span');
    label.setAttribute('data-testid', 'task-text');
    label.textContent = t.text;
    label.style.textDecoration = t.done ? 'line-through' : 'none';
    label.style.opacity = t.done ? '0.6' : '1';

    li.appendChild(checkbox);
    li.appendChild(label);
    list.appendChild(li);
  }

  const pendingCount = tasks.filter((t) => !t.done).length;
  pending.textContent = String(pendingCount);

  empty.style.display = visible.length === 0 ? 'block' : 'none';
}

function showError(msgVisible) {
  const err = app.querySelector('[data-testid="task-error"]');
  err.style.display = msgVisible ? 'block' : 'none';
}

app.addEventListener('click', (e) => {
  const t = e.target;
  if (!(t instanceof HTMLElement)) return;

  if (t.dataset.testid === 'add-task') {
    const input = app.querySelector('[data-testid="task-input"]');
    const text = input.value.trim();

    if (!text) {
      showError(true);
      return;
    }

    showError(false);
    tasks = [...tasks, createTask(text)];
    input.value = '';
    render();
  }

  if (t.dataset.testid === 'filter-all') {
    filter = 'all';
    render();
  }

  if (t.dataset.testid === 'filter-active') {
    filter = 'active';
    render();
  }

  if (t.dataset.testid === 'filter-completed') {
    filter = 'completed';
    render();
  }
});

app.addEventListener('change', (e) => {
  const t = e.target;
  if (!(t instanceof HTMLInputElement)) return;

  if (t.dataset.testid === 'task-toggle') {
    const li = t.closest('[data-testid="task-item"]');
    const id = li?.getAttribute('data-task-id');
    if (!id) return;

    tasks = tasks.map((task) => (task.id === id ? { ...task, done: t.checked } : task));
    render();
  }
});

render();