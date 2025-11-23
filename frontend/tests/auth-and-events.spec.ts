import { test, expect } from '@playwright/test';

test('Login correcto', async ({ page }) => {
  // Ir al login del frontend
  await page.goto('/#/login');

  // Completar el formulario
  await page.getByLabel('Nombre de Usuario o Correo').fill('d');
  await page.getByLabel('Contraseña').fill('123456aA_');

  // Click en el botón
  await page.getByRole('button', { name: /iniciar sesión/i }).click();

  // Esperar redirección / comprobar login correcto
  await expect(page.getByText(/eventos/i)).toBeVisible();
});

test('Login incorrecto', async ({ page }) => {
  // Ir al login del frontend
  await page.goto('/#/login');

  // Completar el formulario
  await page.getByLabel('Nombre de Usuario o Correo').fill('d');
  await page.getByLabel('Contraseña').fill('no_soy');

  // Click en el botón
  await page.getByRole('button', { name: /iniciar sesión/i }).click();

  // Esperar redirección / comprobar login correcto
  await expect(page.getByText(/Error de base de datos/i)).toBeVisible();
});