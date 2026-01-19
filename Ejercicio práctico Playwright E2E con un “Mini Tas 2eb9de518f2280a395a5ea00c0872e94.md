# Ejercicio práctico: Playwright E2E con un “Mini Taskboard” (Vite + Vanilla JS)

### Objetivos

- Crear una app mínima con estado y reglas simples (añadir, completar, filtrar).
- Escribir tests E2E estables usando `data-testid`.
- Practicar asserts sobre UI: lista, contador, validaciones y filtros.
- Ejecutar y depurar con `-headed`, `-ui` y reportes.

> Analogía mental
> 
> 
> Un E2E es una “ruta completa” de usuario: entra, hace acciones, y el DOM confirma el estado final.
> 

## Concepto clave

Si el DOM expone señales claras (IDs estables + textos/contadores), el test no necesita “adivinar” nada.

Resultado conceptual: estabilidad por diseño, no por magia del framework.

## Requisitos previos

- Windows 10/11
- Node.js LTS
- PowerShell
- VSCode (recomendado)

Resultado conceptual: entorno mínimo, reproducible.

## Parte 1. Crear el proyecto

### Paso 1. Crear proyecto Vite vanilla

PowerShell:

```powershell
mkdir mini-taskboard
cd mini-taskboard
npm create vite@latest . -- --template vanilla
npm install

```

Resultado conceptual: base estática local ideal para laboratorios.

### Paso 2. Comprobar que arranca

PowerShell:

```powershell
npm run dev

```

Resultado conceptual: antes de automatizar, validas que existe la app.

## Parte 2. Construir la app “Mini Taskboard”

### Paso 3. Sustituir `src/main.js` por el código completo

`src/main.js`:

```jsx
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

```

Resultado conceptual: app determinista con señales claras para testing.

### Paso 4. Verificación manual mínima

- Añadir tarea con texto: aparece en lista y baja “Pendientes”.
- Añadir tarea vacía: aparece error.
- Marcar una tarea: cambia estilo y contador.
- Filtros: “Activas” y “Completadas” cambian la vista.

Resultado conceptual: el test automatiza comportamientos ya entendidos.

## Parte 3. Instalar Playwright (mínimo)

### Paso 5. Instalar runner

PowerShell:

```powershell
npm install -D @playwright/test

```

Resultado conceptual: runner de tests sin extras.

### Paso 6. Instalar navegadores

PowerShell:

```powershell
npx playwright install

```

Resultado conceptual: E2E real requiere navegador real.

## Parte 4. Configurar Playwright para levantar el servidor

### Paso 7. Crear `playwright.config.ts`

En la raíz:

```tsx
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5173',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});

```

Resultado conceptual: el test controla el ciclo “arranca app → testea → cierra”.

## Parte 5. Tests E2E (3 esenciales)

### Paso 8. Crear `tests/mini-taskboard.spec.ts`

Crea carpeta `tests` y el archivo:

```tsx
import { test, expect } from '@playwright/test';

test('carga la app y muestra el titulo', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('app-title')).toHaveText('Mini Taskboard');
});

test('valida que no se puedan añadir tareas vacías', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('add-task').click();
  await expect(page.getByTestId('task-error')).toBeVisible();

  // Estado vacío visible porque no hay tareas
  await expect(page.getByTestId('empty-state')).toBeVisible();
  await expect(page.getByTestId('pending-count')).toHaveText('0');
});

test('añade tareas, completa una y filtra', async ({ page }) => {
  await page.goto('/');

  // Añadir 2 tareas
  await page.getByTestId('task-input').fill('Aprender Playwright');
  await page.getByTestId('add-task').click();

  await page.getByTestId('task-input').fill('Escribir tests E2E');
  await page.getByTestId('add-task').click();

  await expect(page.getByTestId('pending-count')).toHaveText('2');
  await expect(page.getByTestId('task-item')).toHaveCount(2);

  // Completar la primera tarea visible
  await page.getByTestId('task-toggle').first().check();
  await expect(page.getByTestId('pending-count')).toHaveText('1');

  // Filtro completadas: debe mostrarse 1
  await page.getByTestId('filter-completed').click();
  await expect(page.getByTestId('task-item')).toHaveCount(1);

  // Filtro activas: debe mostrarse 1
  await page.getByTestId('filter-active').click();
  await expect(page.getByTestId('task-item')).toHaveCount(1);

  // Todas: vuelve a 2
  await page.getByTestId('filter-all').click();
  await expect(page.getByTestId('task-item')).toHaveCount(2);
});

```

Resultado conceptual: test de validación + test de flujo + test de filtros.

## Parte 6. Scripts y ejecución

### Paso 9. Scripts en `package.json`

En `"scripts"` deja:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed"
  }
}

```

Resultado conceptual: comandos cortos para repetir el laboratorio.

### Paso 10. Ejecutar

PowerShell:

```powershell
npm run test

```

Opcional:

```powershell
npm run test:headed
npm run test:ui
npx playwright show-report

```

Resultado conceptual: ejecución, depuración y evidencia.

## Parte 7. Diagnóstico directo (si algo falla)

### Si falla instalación de navegadores

- La causa típica es red/proxy. No sigas sin `npx playwright install` correcto.

Resultado conceptual: sin runtime del navegador no existe E2E.

### Si falla por puerto 5173

- Cierra `npm run dev` previos o cambia el puerto en config y en baseURL.

Resultado conceptual: webServer debe coincidir con la URL real.

### Si falla por selectores

- No cambies a clases CSS. Mantén `data-testid`.

Resultado conceptual: selectores estables o tests frágiles.

# Anexo A. Ejercicio extra (ampliación guiada)

## Persistencia en `localStorage` + test de recarga

### Objetivo

Simular una característica “real” sin backend: al recargar la página, se mantiene la lista.

Resultado conceptual: E2E también valida persistencia en el navegador.

### Paso A1. Guardar y cargar desde `localStorage`

En `src/main.js`, añade estas funciones arriba (después de las variables `tasks` y `filter`):

```jsx
const STORAGE_KEY = 'mini-taskboard:v1';

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ tasks }));
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data.tasks)) tasks = data.tasks;
  } catch {
    // Si está corrupto, ignorar
  }
}

```

Llama a `load()` antes del primer `render()`:

```jsx
load();
render();

```

Y llama a `save()` después de cada cambio relevante:

- justo después de añadir tarea
- justo después de toggle (complete/incomplete)

Ejemplo (añadir):

```jsx
tasks = [...tasks, createTask(text)];
save();

```

Ejemplo (toggle):

```jsx
tasks = tasks.map(...);
save();
render();

```

Resultado conceptual: estado persistente sin servidor.

### Paso A2. Test de persistencia tras recarga

Añade este test a `tests/mini-taskboard.spec.ts`:

```tsx
test('mantiene tareas tras recargar (localStorage)', async ({ page }) => {
  await page.goto('/');

  await page.getByTestId('task-input').fill('Persistir tareas');
  await page.getByTestId('add-task').click();
  await expect(page.getByTestId('task-item')).toHaveCount(1);

  await page.reload();
  await expect(page.getByTestId('task-item')).toHaveCount(1);
  await expect(page.getByTestId('task-text').first()).toHaveText('Persistir tareas');
});

```

Resultado conceptual: un E2E valida continuidad del usuario entre sesiones.

# Checklist final

- [ ]  `npm run dev` funciona
- [ ]  `npx playwright install` completo
- [ ]  `npm run test` pasa 3 tests
- [ ]  `test:headed` y `test:ui` funcionan
- [ ]  (Extra) persistencia implementada y test de recarga pasando