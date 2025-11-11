// imagePicker.js
const poolsCache = new Map();

// Lee un .txt de /public e interpreta líneas (urls o nombres de archivo)
async function loadPool(tag) {
  const key = tag.toLowerCase();
  if (poolsCache.has(key)) return poolsCache.get(key);

  try {
    const res = await fetch(`/images/pools/${key}.txt`, { cache: "no-store" });
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
        // Si es nombre de archivo, asume carpeta /images/<tag>/<archivo>
        return `/images/${key}/${l}`;
      });

    poolsCache.set(key, items);
    return items;
  } catch {
    poolsCache.set(key, []); // cachea vacío para no reintentar constantemente
    return [];
  }
}

function pickRandom(arr) {
  return arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;
}

// Elige una imagen para una lista de tags (puedes ponderar, aquí simple)
export async function chooseImageForTags(tags = [], fallbackUrl) {

    console.log("Tags en chooseImageForTags")
    console.log(tags)

  // Estrategia: toma un tag aleatorio de los disponibles y luego una imagen de su pool
  const tagsNorm = (Array.isArray(tags) ? tags : []).map(t => `${t}`.toLowerCase()).filter(Boolean);
  const tag = pickRandom(tagsNorm);

  if (tag) {
    const pool = await loadPool(tag);
    const fromTag = pickRandom(pool);
    if (fromTag) return fromTag;
  }

  // Si no hay pool para ese tag (o no hay tags), intenta “general”
  const generalPool = await loadPool("general");
  const fromGeneral = pickRandom(generalPool);
  if (fromGeneral) return fromGeneral;

  // Fallback definitivo
  return fallbackUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.1.0&auto=format&fit=crop&q=80&w=1000";
}
