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
  await expect(page.getByText('Encuentra tu próximo evento')).toBeVisible();
});

test('Login incorrecto - contraseña incorrecta', async ({ page }) => {
  // Ir al login del frontend
  await page.goto('/#/login');

  // Completar el formulario
  await page.getByLabel('Nombre de Usuario o Correo').fill('d');
  await page.getByLabel('Contraseña').fill('no_soy');

  // Click en el botón
  await page.getByRole('button', { name: /iniciar sesión/i }).click();

  // Esperar redirección / comprobar login correcto
  const banner = page.locator('.message-banner.error');

  await expect(banner).toBeVisible();
  await expect(banner).toContainText(/Contraseña incorrecta|Incorrect password/i);
});

test('Login incorrecto - usuario inexistente', async ({ page }) => {
  // Ir al login del frontend
  await page.goto('/#/login');

  // Completar el formulario
  await page.getByLabel('Nombre de Usuario o Correo').fill('dajnqvpiqnvpuqeirvnqpiev');
  await page.getByLabel('Contraseña').fill('no_soy');

  // Click en el botón
  await page.getByRole('button', { name: /iniciar sesión/i }).click();

  // Esperar redirección / comprobar login correcto
  const banner = page.locator('.message-banner.error');

  await expect(banner).toBeVisible();
  await expect(banner).toContainText('Usuario o correo no encontrado. Verifica tus credenciales.');
});

test('Login incorrecto - Campos inválidos', async ({ page }) => {
  await page.goto('/#/login');

  // No rellenamos nada → enviamos el formulario directamente
  await page.getByRole('button', { name: /iniciar sesión/i }).click();

  // Error del nombre de usuario/correo
  const userError = page.locator('.form-group').nth(0).locator('.error-message');
  await expect(userError).toHaveText('El nombre de usuario o correo es requerido');

  // Error de la contraseña
  const passError = page.locator('.form-group').nth(1).locator('.error-message');
  await expect(passError).toHaveText('La contraseña es requerida');
});
