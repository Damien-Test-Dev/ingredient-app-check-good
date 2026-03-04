import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const ING_DIR = path.join(ROOT, "public", "data", "ingredients");
const OUT = path.join(ROOT, "public", "data", "index.json");

function pickIndexItem(doc) {
  const entry = doc?.entry ?? {};
  const tags = entry?.metadata?.tags ?? [];
  const one_liner = entry?.app_copy?.one_liner ?? "";
  const last_updated = entry?.metadata?.last_updated ?? "";

  return {
    id: entry.id,
    display_name: entry.display_name,
    tags,
    one_liner,
    last_updated,
    file: `ingredients/${entry.id}.json`
  };
}

async function main() {
  const files = (await readdir(ING_DIR)).filter((f) => f.endsWith(".json"));
  const ingredients = [];

  for (const file of files) {
    const p = path.join(ING_DIR, file);
    const raw = await readFile(p, "utf-8");
    const doc = JSON.parse(raw);

    const entryId = doc?.entry?.id;
    const expected = `${entryId}.json`;

    if (!entryId) throw new Error(`Fichier invalide (entry.id manquant): ${file}`);
    if (file !== expected) throw new Error(`Nom de fichier incohérent: ${file} (attendu: ${expected})`);

    ingredients.push(pickIndexItem(doc));
  }

  const seen = new Set();
  for (const it of ingredients) {
    if (seen.has(it.id)) throw new Error(`ID dupliqué: ${it.id}`);
    seen.add(it.id);
  }

  ingredients.sort((a, b) => (a.display_name ?? "").localeCompare(b.display_name ?? "", "fr"));

  const out = { schema_version: "1.0.0", locale: "fr-FR", ingredients };
  await writeFile(OUT, JSON.stringify(out, null, 2), "utf-8");
  console.log(`OK: index généré -> public/data/index.json (${ingredients.length} items)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
