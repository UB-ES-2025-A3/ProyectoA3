import { test, expect, Page } from '@playwright/test';

// Helper de login reutilizable
async function login(page: Page) {
  await page.goto('/#/login');

  await page.getByLabel('Nombre de Usuario o Correo').fill('no_borrar');
  await page.getByLabel('Contraseña').fill('123456aA_');

  await page.getByRole('button', { name: /iniciar sesión/i }).click();

  // Página de inicio cargada
  await expect(page.getByTestId('home-title')).toBeVisible();
}

async function abrirModalCrearEvento(page: Page) {
  // En HomePage, el evento se crea haciendo clic en el mapa
  // Primero esperamos a que el mapa esté visible
  await page.waitForSelector('.leaflet-container', { timeout: 10000 });
  // Esperar un poco más para que el mapa esté completamente cargado
  await page.waitForTimeout(1000);
  
  // Hacer clic en el mapa (coordenadas aproximadas del centro)
  const mapContainer = page.locator('.leaflet-container');
  await mapContainer.click({ position: { x: 400, y: 300 } });
  
  // Esperar y confirmar el modal de confirmación
  await page.waitForTimeout(1000);
  const confirmButton = page.getByRole('button', { name: /sí|confirmar|aceptar|crear/i });
  if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await confirmButton.click();
  }

  // Esperar a que aparezca el formulario de crear evento
  await expect(
    page.getByRole('heading', { name: /crear nuevo evento/i })
  ).toBeVisible({ timeout: 5000 });
}

test.describe('Crear evento', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await abrirModalCrearEvento(page);
  });

  //  Campos vacíos → mostrar errores de validación
test('CreateEvent - muestra errores cuando los campos obligatorios están vacíos', async ({ page }) => {
  
  const modal = page.locator('.create-event-modal-content');

  // Cuando se abre desde el mapa, el campo "lugar" se rellena automáticamente
  // Necesitamos limpiarlo para probar la validación
  const lugarInput = page.getByLabel(/Lugar/i);
  if (await lugarInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await lugarInput.clear();
  }

  await modal.getByRole('button', { name: 'Crear Evento' }).click();

  await expect(
    page.getByText('El título del evento es requerido')
  ).toBeVisible();

  await expect(
    page.getByText('La fecha es requerida')
  ).toBeVisible();

  await expect(
    page.getByText('La hora es requerida')
  ).toBeVisible();

  await expect(
    page.getByText('Debes seleccionar un idioma')
  ).toBeVisible();

  await expect(
    page.getByText('Las plazas disponibles son requeridas')
  ).toBeVisible();

  await expect(
    page.getByText('El lugar es requerido')
  ).toBeVisible();
});


  // Fecha anterior a hoy → no debería ser válida
  test('CreateEvent - no permite fecha anterior a hoy', async ({ page }) => {


    // Rellenamos todos los campos con datos válidos salvo la fecha
    await page.getByLabel('Título del Evento *').fill('Evento pasado E2E');
    await page.getByLabel('Etiquetas').selectOption('turismo');
    await page.getByLabel('Hora *').fill('10:00');
    await page.getByLabel('Plazas Disponibles *').fill('5');
    await page.getByLabel('Lugar *').fill('Sitio de prueba');
    await page.getByLabel('Idioma *').selectOption('es');

    // Fecha en el pasado (mucho antes del min de hoy)
    const pastDate = '2000-01-01';
    const fechaInput = page.getByLabel('Fecha *');
    await fechaInput.fill(pastDate);

    const modal = page.locator('.create-event-modal-content');

    await modal.getByRole('button', { name: 'Crear Evento' }).click();

    // 1º intentamos ver si tu validación de React se ejecuta
    const reactError = page.getByText('La fecha no puede ser anterior a hoy');
    if (await reactError.count()) {
      await expect(reactError).toBeVisible();
      return;
    }

    // 2º fallback: comprobamos la validación HTML5 del propio input (min=HOY)
    const isValid = await fechaInput.evaluate(
      (el) => (el as HTMLInputElement).checkValidity()
    );

    expect(isValid).toBe(false);
  });

  // Crear evento nuevo (dinámico) — pero SKIP para no tocar BBDD de prod
  test.skip('CreateEvent - crear evento nuevo dinámico (SKIP en prod)', async ({ page }) => {
    const now = Date.now();
    const titulo = `E2E Evento ${now}`;

    // Fecha futura (mañana)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const futureDate = tomorrow.toISOString().split('T')[0]; // YYYY-MM-DD

    await page.getByLabel('Título del Evento *').fill(titulo);
    await page.getByLabel('Etiquetas').selectOption('turismo');
    await page.getByLabel('Fecha *').fill(futureDate);
    await page.getByLabel('Hora *').fill('18:30');
    await page.getByLabel('Idioma *').selectOption('es');
    await page.getByLabel('Plazas Disponibles *').fill('10');
    await page.getByLabel('Lugar *').fill('Café E2E Testing');
    await page.getByLabel('Descripción').fill('Evento de prueba creado por tests E2E.');

    const modal = page.locator('.create-event-modal-content');
    await modal.getByRole('button', { name: 'Crear Evento' }).click();

    // Si tu EventPage muestra un banner al recargar eventos:
    await expect(
      page.getByText('Evento creado correctamente!')
    ).toBeVisible();


  });
});
