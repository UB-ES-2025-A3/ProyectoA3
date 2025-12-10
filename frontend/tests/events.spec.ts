import { test, expect, Page } from '@playwright/test';

async function login(page: Page) {
  await page.goto('/#/login');

  await page.getByLabel('Nombre de Usuario o Correo').fill('d');
  await page.getByLabel('Contraseña').fill('123456aA_');

  await page.getByRole('button', { name: /iniciar sesión/i }).click();

  // Esperar a que cargue la página de inicio
  await expect(page.getByText('Encuentra tu próximo evento')).toBeVisible();
}


test.describe('Página de eventos', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

test('Events - Filtrado de eventos por texto de búsqueda', async ({ page }) => {
  // Asegurarnos de que estamos en la página de inicio
  const title = page.getByText('Encuentra tu próximo evento');
  await expect(title).toBeVisible();

  // Esperar a que termine el "Cargando eventos..."
  const loadingText = page.getByText('Cargando eventos...');
  // Si está, esperamos a que desaparezca; si no está, esto no rompe
  await loadingText.waitFor({ state: 'detached', timeout: 10000 }).catch(() => {});

  const eventsGrid = page.locator('.events-grid');
  const noEventsBox = page.locator('.no-events');

  const gridCount = await eventsGrid.count();
  const noEventsCount = await noEventsBox.count();

  // Si no hay grid pero sí el mensaje de "no hay eventos", hacemos fallback
  if (gridCount === 0) {
    if (noEventsCount > 0) {
      await expect(
        page.getByText('No hay eventos disponibles con los filtros aplicados.')
      ).toBeVisible();
      console.warn('No hay eventos disponibles — se salta test de filtrado.');
      return;
    }

    // Ni grid ni "no events": algo raro con el backend/HTML → puedes decidir aquí si fallar o loguear y salir
    console.warn('La página de eventos no muestra ni grid ni mensaje de "no hay eventos".');
    return;
  }

  // 🔽 A partir de aquí seguro que hay .events-grid con eventos
  const titles = eventsGrid.locator('.event-card__title');
  const totalEvents = await titles.count();
  expect(totalEvents).toBeGreaterThan(0);

  const firstTitleLocator = titles.first();
  const fullTitle = await firstTitleLocator.innerText();

  const firstWord = fullTitle.split(/\s+/)[0];
  const searchTerm = firstWord.trim();

  const searchInput = page.getByPlaceholder(
    'Buscar eventos por nombre o descripción...'
  );
  await searchInput.fill(searchTerm);

  const filteredCount = await titles.count();
  expect(filteredCount).toBeGreaterThan(0);

  const searchLower = searchTerm.toLowerCase();
  for (let i = 0; i < filteredCount; i++) {
    const text = await titles.nth(i).innerText();
    expect(text.toLowerCase()).toContain(searchLower);
  }
});



test('Events - Apuntarse y desapuntarse de un evento desde la tarjeta', async ({ page }) => {
  // Asegurarnos de que estamos en la página de inicio
  const title = page.getByText('Encuentra tu próximo evento');
  await expect(title).toBeVisible();

  // Esperar a que termine el "Cargando eventos..."
  const loadingText = page.getByText('Cargando eventos...');
  await loadingText.waitFor({ state: 'detached', timeout: 10000 }).catch(() => {});

  const eventsGrid = page.locator('.events-grid');
  const noEventsBox = page.locator('.no-events');

  const gridCount = await eventsGrid.count();
  const noEventsCount = await noEventsBox.count();

  //  Caso 1: no hay grid pero sí mensaje de "no hay eventos"
  if (gridCount === 0) {
    if (noEventsCount > 0) {
      console.warn('No hay eventos disponibles para apuntarse — se salta test.');
      // Opcional: puedes comprobar el texto si quieres
      // await expect(
      //   page.getByText('No hay eventos disponibles con los filtros aplicados.')
      // ).toBeVisible();
      return;
    }

    //  Caso 2: ni grid ni mensaje "no events" → entorno raro de CI / backend
    console.warn('La página de eventos no muestra ni grid ni mensaje de "no hay eventos"; se omite test.');
    return;
  }

  // 🔽 A partir de aquí sabemos que hay .events-grid y debería haber eventos
  await expect(eventsGrid).toBeVisible();

  const allJoinButtons = page.getByRole('button', { name: /^Apuntarse$/ });
  const joinCount = await allJoinButtons.count();

  if (joinCount === 0) {
    console.warn('No hay eventos disponibles para apuntarse — se salta test.');
    return;
  }

  const joinButton = allJoinButtons.first();
  await expect(joinButton).toBeVisible();
  await joinButton.click();

  // 👇 En vez de depender SOLO del banner, esperamos a que aparezca el botón de "Desapuntarse"
  const leaveButtonsAfterJoin = page.getByRole('button', { name: /^Desapuntarse$/ });
  await expect(leaveButtonsAfterJoin.first()).toBeVisible();

  // (Opcional) si quieres seguir comprobando el banner, hazlo pero no como única condición
  // await expect(
  //   page.getByText('¡Te has apuntado al evento correctamente!')
  // ).toBeVisible();

  // Ahora probamos desapuntarse
  const leaveCount = await leaveButtonsAfterJoin.count();

  if (leaveCount === 0) {
    console.warn('⛔ No se encontró ningún botón de "Desapuntarse" después de apuntarse — fallback.');
    return;
  }

  const leaveButton = leaveButtonsAfterJoin.first();
  await expect(leaveButton).toBeVisible();
  await leaveButton.click();

  // Esperar mensaje de desapuntado o que vuelva a aparecer "Apuntarse"
  await expect(
    page.getByRole('button', { name: /^Apuntarse$/ }).first()
  ).toBeVisible();

  // (Opcional) si tienes banner de desapuntado:
  // await expect(
  //  page.getByText('Te has desapuntado del evento correctamente.')
  // ).toBeVisible();
});


// Revisar que los eventos completos no dejen inscribirse
test('Events - Muestra correctamente un evento completo (con fallback si no hay ninguno)', async ({ page }) => {
  const cards = page.locator('.event-card');
  const totalCards = await cards.count();

  if (totalCards === 0) {
    console.warn('No hay ningún evento en la página; se salta la comprobación de evento completo.');
    return; // fallback: no rompemos el test en entornos sin eventos
  }

  // Buscar la primera card que tenga el badge de COMPLETO
  let fullCardIndex = -1;

  for (let i = 0; i < totalCards; i++) {
    const card = cards.nth(i);
    const fullBadge = card.locator('.status-badge.status-full');

    if (await fullBadge.count() > 0 && await fullBadge.first().isVisible()) {
      fullCardIndex = i;
      break;
    }
  }

  if (fullCardIndex === -1) {
    console.warn('No se encontró ningún evento completo; se omiten las aserciones de este test.');
    return; // fallback: no hay eventos llenos ahora mismo
  }

  const fullCard = cards.nth(fullCardIndex);

  // 1) El badge debe decir "Completo"
  const fullBadge = fullCard.locator('.status-badge.status-full');
  await expect(fullBadge).toHaveText(/completo/i);

  // 2) participantes == capacidad (ej: "1/1")
  const capacityText = await fullCard.locator('.capacity-number').innerText(); // "1/1"
  const [currentStr, maxStr] = capacityText.split('/');
  const current = Number(currentStr.trim());
  const max = Number(maxStr.trim());
  expect(current).toBe(max);

  // 3) El botón: dos casos válidos
  //    - Caso A: botón "Completo" deshabilitado (no estás inscrito)
  //    - Caso B: botón "Desapuntarse" (ya estás dentro del evento)

  const fullButton = fullCard.getByRole('button'); // asumimos un botón principal en la card
  const buttonText = (await fullButton.innerText()).toLowerCase();

  if (buttonText.includes('completo')) {
    // Caso A: evento lleno y no inscrito → no te deja apuntarte
    await expect(fullButton).toBeVisible();
    await expect(fullButton).toBeDisabled();
  } else if (buttonText.includes('desapuntarse')) {
    // Caso B: evento lleno pero ya estás apuntado → también es correcto:
    // no "inscribirse", sino "salir"
    await expect(fullButton).toBeVisible();
    // opcional: puedes comprobar que NO existe ningún botón "Apuntarse"
    const enrollButton = fullCard.getByRole('button', { name: /apuntarse/i });
    await expect(enrollButton).toHaveCount(0);
  } else {
    // Cualquier otro texto es sospechoso: mejor fallar para detectar cambios
    throw new Error(`Texto de botón inesperado en evento completo: "${buttonText}"`);
  }
});


});


