const cache = new Map();

async function fetchJson(path) {
  if (cache.has(path)) return cache.get(path);

  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Erreur fetch ${path} (${res.status})`);

  const data = await res.json();
  cache.set(path, data);
  return data;
}

export async function loadIndex() {
  const data = await fetchJson("./data/index.json");
  return data.ingredients ?? [];
}

export async function loadAliases() {
  try {
    return await fetchJson("./data/aliases.json");
  } catch {
    return {};
  }
}

export async function loadIngredientEntryById(id, index) {
  const item = index.find((x) => x.id === id);
  if (!item) throw new Error(`Ingrédient introuvable: ${id}`);

  const full = await fetchJson(`./data/${item.file}`);
  return full.entry;
}
