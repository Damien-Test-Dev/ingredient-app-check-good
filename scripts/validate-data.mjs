import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const ING_DIR = path.join(ROOT, "public", "data", "ingredients");
const ALIASES_PATH = path.join(ROOT, "public", "data", "aliases.json");

async function loadAliases() {
  try {
    const raw = await readFile(ALIASES_PATH, "utf-8");
    const data = JSON.parse(raw);
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

function collectRefs(entry) {
  const refs = new Set();

  (entry?.metadata?.related_entries ?? []).forEach((id) => refs.add(id));

  (entry?.effects?.blend_effects ?? []).forEach((b) => {
    (b?.ingredients ?? []).forEach((ing) => {
      if (ing?.id) refs.add(ing.id);
    });
  });

  (entry?.consumption_and_cooking?.modes ?? []).forEach((m) => {
    (m?.compatible_additions ?? []).forEach((a) => {
      if (a?.id) refs.add(a.id);
    });
  });

  return refs;
}

function requiredString(obj, key, file) {
  const v = obj?.[key];
  if (typeof v !== "string" || !v.trim()) throw new Error(`${file}: champ requis invalide -> ${key}`);
}

async function main() {
  const aliases = await loadAliases();
  const files = (await readdir(ING_DIR)).filter((f) => f.endsWith(".json"));

  const entries = [];
  for (const file of files) {
    const raw = await readFile(path.join(ING_DIR, file), "utf-8");
    const doc = JSON.parse(raw);

    requiredString(doc, "schema_version", file);
    requiredString(doc, "locale", file);

    const entry = doc?.entry;
    if (!entry) throw new Error(`${file}: entry manquant`);

    requiredString(entry, "id", file);
    requiredString(entry, "display_name", file);
    requiredString(entry, "type", file);

    const expected = `${entry.id}.json`;
    if (file !== expected) throw new Error(`${file}: nom de fichier != entry.id (attendu ${expected})`);

    entries.push(entry);
  }

  const ids = new Set(entries.map((e) => e.id));
  if (ids.size !== entries.length) throw new Error("IDs dupliqués détectés");

  const missing = [];
  for (const e of entries) {
    const refs = collectRefs(e);
    for (const id of refs) {
      if (ids.has(id)) continue;

      const aliased = aliases[id];
      if (aliased && ids.has(aliased)) continue;

      missing.push({ from: e.id, missing: id, hint: aliased ? `alias->${aliased}` : "" });
    }
  }

  if (missing.length) {
    const msg = missing.map((x) => `- ${x.from} -> ${x.missing} ${x.hint}`.trim()).join("\n");
    throw new Error(`Références cassées:\n${msg}`);
  }

  console.log(`OK: validation data (${entries.length} fichiers)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
