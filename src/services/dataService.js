const cache = new Map();

async function fetchJsonTry(paths) {
  for (const path of paths) {
    if (cache.has(path)) return cache.get(path);

    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) continue;

      const data = await res.json();
      cache.set(path, data);
      return data;
    } catch {
      // try next
    }
  }

  throw new Error(`Impossible de charger JSON. Chemins testés: ${paths.join(", ")}`);
}

export async function loadIndex() {
  // Vite: ./data/index.json (copié depuis public)
  // Static repo: ./public/data/index.json
  const data = await fetchJsonTry(["./data/index.json", "./public/data/index.json"]);
  return data.ingredients ?? [];
}

export async function loadAliases() {
  try {
    return await fetchJsonTry(["./data/aliases.json", "./public/data/aliases.json"]);
  } catch {
    return {};
  }
}

export async function loadIngredientEntryById(id, index) {
  const item = index.find((x) => x.id === id);
  if (!item) throw new Error(`Ingrédient introuvable: ${id}`);

  const full = await fetchJsonTry([
    `./data/${item.file}`,        // Vite
    `./public/data/${item.file}`  // Static repo
  ]);

  return full.entry;
}
