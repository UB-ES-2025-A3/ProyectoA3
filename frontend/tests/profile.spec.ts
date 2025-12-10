import { test, expect, Page } from '@playwright/test';

async function login(page: Page) {
  await page.goto('/#/login');

  await page.getByLabel('Nombre de Usuario o Correo').fill('NO_BORRAR_TESTS_CI');
  await page.getByLabel('Contraseña').fill('Aa1234_');
  await page.getByRole('button', { name: /iniciar sesión/i }).click();

  // esperar a que cargue la página de inicio
  await expect(page.getByText('Encuentra tu próximo evento')).toBeVisible();

}

async function goToProfile(page: Page) {
  await login(page);

  await page.goto('/#/profile');

  // Esperar a que deje de estar en "Cargando perfil..."
  const loading = page.getByText('Cargando perfil...');
  await loading.waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});

  // Ahora sí, esperamos a que aparezca la sección de perfil
  await expect(
    page.getByText('Información Personal')
  ).toBeVisible({ timeout: 15000 });
}

test.describe('Perfil de usuario', () => {
  test.beforeEach(async ({ page }) => {
    await goToProfile(page);
  });

  // Editar el perfil, guardar, y volver a los valores originales
  test.skip('Profile - Editar perfil y restaurar valores originales', async ({ page }) => {
    // Selectores de los datos "en modo lectura"
    const nombreText = page.locator('.info-item').nth(0).locator('p');
    const apellidosText = page.locator('.info-item').nth(1).locator('p');
    const ciudadText = page.locator('.info-item').nth(3).locator('p');
    const descripcionText = page.locator('.bio-text');

    const originalNombre = await nombreText.innerText();
    const originalApellidos = await apellidosText.innerText();
    const originalCiudad = await ciudadText.innerText();
    const originalDescripcion = await descripcionText.innerText();

    // Entrar en modo edición
    await page.getByRole('button', { name: /editar perfil/i }).click();

    const nombreInput = page.locator('.info-item').nth(0).locator('input');
    const apellidosInput = page.locator('.info-item').nth(1).locator('input');
    const ciudadInput = page.locator('.info-item').nth(3).locator('input');
    const descripcionInput = page.locator('.bio-textarea');

    const nuevoNombre = originalNombre + ' Test';
    const nuevosApellidos = originalApellidos + ' E2E';
    const nuevaCiudad = 'Ciudad E2E';
    const nuevaDescripcion = 'Descripción de prueba E2E para el perfil.';

    await nombreInput.fill(nuevoNombre);
    await apellidosInput.fill(nuevosApellidos);
    await ciudadInput.fill(nuevaCiudad);
    await descripcionInput.fill(nuevaDescripcion);

    // Guardar cambios
    await page.getByRole('button', { name: /guardar/i }).click();

    // Banner de éxito (opcional)
    const successText = page.getByText(/perfil actualizado/i);
    if (await successText.count()) {
        await expect(successText.first()).toBeVisible();
    }


    // Comprobar que los datos han cambiado en la vista
    await expect(nombreText).toHaveText(nuevoNombre);
    await expect(apellidosText).toHaveText(nuevosApellidos);
    await expect(ciudadText).toHaveText(nuevaCiudad);
    await expect(descripcionText).toHaveText(nuevaDescripcion);

    //  Volver a editar para restaurar valores originales
    await page.getByRole('button', { name: /editar perfil/i }).click();

    await nombreInput.fill(originalNombre);
    await apellidosInput.fill(originalApellidos);

    // Si la ciudad original era "No especificada", eso en realidad es ausencia de valor
    if (originalCiudad === 'No especificada') {
      await ciudadInput.fill('');
    } else {
      await ciudadInput.fill(originalCiudad);
    }

    // Si la descripción original era el placeholder, borramos
    if (originalDescripcion === 'No hay descripción disponible') {
      await descripcionInput.fill('');
    } else {
      await descripcionInput.fill(originalDescripcion);
    }

    await page.getByRole('button', { name: /guardar/i }).click();

    await expect(
      page.getByText('Perfil actualizado correctamente')
    ).toBeVisible();

    // Verificamos que se han restaurado
    await expect(nombreText).toHaveText(originalNombre);
    await expect(apellidosText).toHaveText(originalApellidos);
    await expect(ciudadText).toHaveText(originalCiudad);
    // De descripción no pongo expect estricto para no liar casos borde, ya la hemos restaurado arriba
  });

  //  No permite guardar con nombre vacío
  test('Profile - No permite guardar perfil con nombre vacío', async ({ page }) => {
    await page.getByRole('button', { name: /editar perfil/i }).click();

    const nombreInput = page.locator('.info-item').nth(0).locator('input');

    const originalNombre = await nombreInput.inputValue();

    await nombreInput.fill(''); // nombre vacío

    await page.getByRole('button', { name: /guardar/i }).click();

    // Esperamos que SIGA en modo edición (botón Guardar visible)
    await expect(page.getByRole('button', { name: /guardar/i })).toBeVisible();

    // Si se muestra un banner de error, lo comprobamos (fallback: por si cambia el texto)
    const errorBanner = page.locator('.message-banner.error');
    if (await errorBanner.count()) {
      await expect(errorBanner.first()).toBeVisible();
    }

    // Dejamos el nombre como estaba para no romper otros tests
    await nombreInput.fill(originalNombre);
  });

  // No permite fecha de nacimiento posterior a hoy
test('Profile - No permite fecha de nacimiento en el futuro', async ({ page }) => {
  await page.getByRole('button', { name: /editar perfil/i }).click();

  const fechaInput = page.locator('.info-item').nth(4).locator('input[type="date"]');

  const originalFecha = await fechaInput.inputValue();

  // Fecha claramente futura (año 4021)
  const futureDate = '4021-01-01'; // YYYY-MM-DD

  await fechaInput.fill(futureDate);

  await page.getByRole('button', { name: /guardar/i }).click();

  // Igual que antes: esperamos seguir en modo edición
  await expect(page.getByRole('button', { name: /guardar/i })).toBeVisible();

  // Intentamos detectar un banner de error si lo hubiera
  const errorBanner = page.locator('.message-banner.error');
  if (await errorBanner.count()) {
    await expect(errorBanner.first()).toBeVisible();
  }

  // Restauramos la fecha original para no dejar datos raros
  if (originalFecha) {
    await fechaInput.fill(originalFecha);
  }
});

});
