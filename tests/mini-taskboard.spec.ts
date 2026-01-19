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