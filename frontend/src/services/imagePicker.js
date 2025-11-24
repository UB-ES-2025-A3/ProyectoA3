// imagePicker.js
const poolsCache = new Map();

function getBase() {
  // CRA inyecta PUBLIC_URL en build; en local es vacío (=> '/')
  let base = process.env.PUBLIC_URL || "/";
  if (!base.endsWith("/")) base += "/";
  return base; // '/' en local, '/ProyectoA3/' en GitHub Pages
}

// Lee un .txt de /public e interpreta líneas (urls o nombres de archivo)
async function loadPool(tag) {
  const key = tag.toLowerCase();
  if (poolsCache.has(key)) return poolsCache.get(key);

  try {
    const base = getBase();
    const poolUrl = `${base}images/pools/${key}.txt`;

    console.log("Miramos en pool:", poolUrl);

    const res = await fetch(poolUrl, { cache: "no-store" });
    if (!res.ok) throw new Error("No pool");
    const text = await res.text();

    // Limpia líneas vacías / comentarios
    const items = text
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(l => l && !l.startsWith("#"))
      .map(l => {
        // Si parece URL absoluta, úsala tal cual
        if (/^https?:\/\//i.test(l)) return l;
        // Si es nombre de archivo, asume carpeta /images/<tag>/<archivo> bajo el base
        return `${base}images/${key}/${l}`;
      });

    poolsCache.set(key, items);
    return items;
  } catch (e) {
    console.log("Error al cargar pool")
    poolsCache.set(key, []); // cachea vacío para no reintentar constantemente
    return [];
  }
}

function pickRandom(arr) {
  return arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;
}

// Elige una imagen para una lista de tags (puedes ponderar, aquí simple)
export async function chooseImageForTags(tags = [], fallbackUrl) {
  // Usamos sessionStorage para almacenar el índice aleatorio
  const cachedImageIndex = sessionStorage.getItem('randomImageIndex');
  let selectedImage = null;

  if (cachedImageIndex !== null) {
    console.log("Imagen seleccionada de la sesión mediante índice");
    // Si el índice ya existe, obtenemos la imagen de la pool correspondiente
    const index = parseInt(cachedImageIndex, 10);
    const pool = await loadPool(tags[0] || 'general');  // Usamos el primer tag o general
    selectedImage = pool[index];
  } else {
    console.log("Generando una nueva imagen aleatoria");

    // Si no hay índice guardado, seleccionamos una imagen aleatoria y almacenamos el índice
    const tagsNorm = (Array.isArray(tags) ? tags : [])
      .filter(Boolean);
    const tag = pickRandom(tagsNorm) || 'general';  // Si no hay tags, usamos 'general'

    const pool = await loadPool(tag);
    const randomIndex = Math.floor(Math.random() * pool.length);  // Generamos el índice aleatorio
    selectedImage = pool[randomIndex];

    // Guardamos el índice en sessionStorage para la próxima vez
    sessionStorage.setItem('randomImageIndex', randomIndex);
  }

  // Si no se encuentra imagen en el pool, usamos la imagen fallback
  if (!selectedImage) {
    console.log("No se encontró imagen en pools, usando fallback");
    selectedImage = fallbackUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1000";
  }

  return selectedImage;
}
