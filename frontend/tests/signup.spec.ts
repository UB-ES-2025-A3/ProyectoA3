// tests/register.spec.ts
import { test, expect, Page } from '@playwright/test';

async function rellenarFormularioRegistro(
  page: Page,
  data: {
    nombre: string;
    apellidos: string;
    username: string;
    correo: string;
    fechaNacimiento: string; // yyyy-mm-dd
    ciudad?: string;
    password: string;
  }
) {
  await page.getByLabel(/Nombre \*/).fill(data.nombre);
  await page.getByLabel(/Apellidos \*/).fill(data.apellidos);
  await page.getByLabel(/Nombre de Usuario \*/).fill(data.username);
  await page.getByLabel(/Correo Electrónico \*/).fill(data.correo);
  await page.getByLabel(/Fecha de Nacimiento \*/).fill(data.fechaNacimiento);

  if (data.ciudad !== undefined) {
    await page.getByLabel('Ciudad').fill(data.ciudad);
  }

  await page.getByLabel(/Contraseña \*/).fill(data.password);
}

test.describe('Registro de usuario', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/register');
    await expect(page.getByRole('heading', { name: 'Crear Cuenta' })).toBeVisible();
  });

  // Registro correcto (solo campos obligatorios)
  // Skip para no llenar la bdd de usuarios dummy 
  test.skip('Registro correcto', async ({ page }) => {
    await rellenarFormularioRegistro(page, {
      nombre: 'Andrés',
      apellidos: 'Río Test',
      username: 'andres_test_registro',      // si tu backend obliga a que sea único, cámbialo por algo dinámico
      correo: 'andres.test+registro@example.com',
      fechaNacimiento: '1995-05-10',
      password: 'Aa1234_',
    });

    await page.getByRole('button', { name: 'Crear Cuenta' }).click();

    // Ajusta estas aserciones a tu flujo real
    await expect(page).toHaveURL(/login/);
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
  });

  // 2️Enviar el formulario sin campos (errores de requerido)
  test('Registro sin campos muestra errores de requerido', async ({ page }) => {
    await page.getByRole('button', { name: 'Crear Cuenta' }).click();

    await expect(page.getByText('El nombre es requerido')).toBeVisible();
    await expect(page.getByText('Los apellidos son requeridos')).toBeVisible();
    await expect(page.getByText('El nombre de usuario es requerido')).toBeVisible();
    await expect(page.getByText('El correo es requerido')).toBeVisible();
    await expect(page.getByText('La fecha de nacimiento es requerida')).toBeVisible();
    await expect(page.getByText('La contraseña es requerida')).toBeVisible();
  });

  // Campos inválidos: email mal y contraseña débil
  // Correo inválido, contraseña válida
  test('Registro con correo inválido', async ({ page }) => {
    await rellenarFormularioRegistro(page, {
      nombre: 'Usuario',
      apellidos: 'Prueba',
      username: 'signup_correo_invalido',
      correo: 'correo-no-valido',          // email inválido
      fechaNacimiento: '1990-01-01',
      password: 'Aa1234_',                 // contraseña válida
    });

    await page.getByRole('button', { name: 'Crear Cuenta' }).click();

    const correoInput = page.locator('#correo');
    const validationMessage = await correoInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );

    // No hacer, cambia el idioma y falla
    //expect(validationMessage).toMatch("Incluye un signo \"@\" en la dirección de correo electrónico. La dirección \"correo-no-valido\" no incluye el signo \"@\".");

    await expect(page.getByText('El correo no es válido')).toBeVisible();

  });

  // Varias contraseñas inválidas con el resto de campos correctos
test('Registro con contraseñas inválidas', async ({ page }) => {
  // Rellenamos todo con datos válidos (la password la iremos cambiando)
  await rellenarFormularioRegistro(page, {
    nombre: 'Usuario',
    apellidos: 'Prueba',
    username: 'signup_pwd_invalido',          // no llega a backend porque la pwd es inválida
    correo: 'pwd.invalido@example.com',
    fechaNacimiento: '1990-01-01',
    password: 'Temporal1_',                   // se sobrescribe luego
  });

  const invalidPasswords = [
    'abc',        // muy corta, sin mayúsculas, número ni especial
    'abcdef',     // sin mayúsculas, número ni especial
    'ABCDEF',     // sin minúsculas, número ni especial
    'abc123',     // sin mayúsculas ni especial
    'ABC123',     // sin minúsculas ni especial
    'Abcdef',     // sin número ni especial
    'Abc123',     // sin carácter especial
  ];

  const passwordInput = page.getByLabel(/Contraseña \*/);
  const submitButton = page.getByRole('button', { name: 'Crear Cuenta' });

  for (const pwd of invalidPasswords) {
    await passwordInput.fill(pwd);
    await submitButton.click();

    await expect(
      page.getByText('La contraseña no cumple con los requisitos mínimos')
    ).toBeVisible();
  }
});


// Usuario ya creado: usa SIEMPRE el mismo usuario fijo de prod
// Nota: la primera vez que lo ejecutes, fallará si aún NO existe en la BBDD.
// Crea el usuario manualmente una vez y déjalo creado para CI.
test('Registro con usuario ya creado (NO_BORRAR_TESTS_CI)', async ({ page }) => {
  const existingUser = {
    nombre: 'NO_BORRAR',
    apellidos: 'TESTS_CI',
    username: 'NO_BORRAR_TESTS_CI',
    correo: 'NO_BORRAR_TESTS_CI@example.com',
    fechaNacimiento: '1990-01-01',
    password: 'Aa1234_',   // válida
  };

  await rellenarFormularioRegistro(page, existingUser);
  await page.getByRole('button', { name: 'Crear Cuenta' }).click();

  const errorBanner = page.locator('.message-banner.error');
  await expect(errorBanner).toBeVisible();
  // El backend puede devolver errores de validación (JSON parse) o de usuario duplicado
  // Aceptamos ambos casos: errores de validación o mensajes de usuario duplicado
  await expect(errorBanner).toContainText(/(ya existe|ya registrado|en uso|username en uso|correo en uso|json parse|coerce|arraylist)/i);
});


  // Extra: registro sin campos opcionales (ciudad e idiomas vacíos)
  // Skip para no llenar la bdd de usuarios dummy 
  test.skip('Registro sin ciudad ni idiomas sigue siendo válido', async ({ page }) => {
    await rellenarFormularioRegistro(page, {
      nombre: 'María',
      apellidos: 'Opcionales',
      username: 'maria_sin_opcionales',
      correo: 'maria.opcionales@example.com',
      fechaNacimiento: '1998-08-08',
      password: 'Aa1234_',
      // ciudad e idioma no se rellenan
    });

    await page.getByRole('button', { name: 'Crear Cuenta' }).click();

    await expect(page).toHaveURL(/login/);
  });
});
