import { el, clear } from "../utils/dom.js";

const INTERNAL_TAGS = new Set(["placeholder", "a_completer", "encadrement"]);

function formatTagLabel(tag) {
  const map = {
    gros_intestin: "Gros intestin",
    superfood: "Superfood",
    foie: "Foie",
    rein: "Rein",
    poumon: "Poumon",
    yeux: "Yeux",
    transit: "Transit",
    jing: "Jing",
    sang: "Sang",
    yin: "Yin",
    routine: "Routine"
  };

  if (map[tag]) return map[tag];

  const pretty = String(tag).replace(/_/g, " ").trim();
  return pretty.charAt(0).toUpperCase() + pretty.slice(1);
}

function collectTagsWithCounts(index) {
  const counts = new Map();

  for (const item of index) {
    for (const t of item.tags ?? []) {
      if (INTERNAL_TAGS.has(t)) continue;
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }

  const tags = Array.from(counts.entries()).map(([tag, count]) => ({
    tag,
    label: formatTagLabel(tag),
    count
  }));

  tags.sort((a, b) => a.label.localeCompare(b.label, "fr"));
  return tags;
}

export function renderFilters({ root, state, onChange }) {
  clear(root);

  const tags = collectTagsWithCounts(state.index);

  const search = el("input", {
    class: "input",
    type: "search",
    placeholder: "Rechercher (nom, tags)…",
    value: state.query,
    oninput: (e) => {
      state.query = e.target.value;
      onChange();
    }
  });

  const select = el("select", {
    class: "select",
    onchange: (e) => {
      state.tag = e.target.value;
      onChange();
    }
  });

  // ✅ Changement : plus clair pour l’end user
  select.appendChild(el("option", { value: "all", text: "Tous les ingrédients" }));

  for (const t of tags) {
    select.appendChild(
      el("option", {
        value: t.tag,
        text: `${t.label} (${t.count})`,
        selected: t.tag === state.tag ? "true" : null
      })
    );
  }

  const wrap = el(
    "div",
    { class: "filters" },
    el("div", { class: "filters__row" }, el("div", { class: "label", text: "Recherche" }), search),
    el("div", { class: "filters__row" }, el("div", { class: "label", text: "Tag" }), select)
  );

  root.appendChild(wrap);
}
