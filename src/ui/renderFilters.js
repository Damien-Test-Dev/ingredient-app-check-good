import { el, clear } from "../utils/dom.js";

function collectTags(index) {
  const set = new Set();
  for (const item of index) (item.tags ?? []).forEach((t) => set.add(t));
  return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
}

export function renderFilters({ root, state, onChange }) {
  clear(root);

  const tags = collectTags(state.index);

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

  for (const t of tags) {
    select.appendChild(
      el("option", { value: t, text: t === "all" ? "Tous les tags" : t, selected: t === state.tag ? "true" : null })
    );
  }

  root.appendChild(
    el(
      "div",
      { class: "filters" },
      el("div", { class: "filters__row" }, el("div", { class: "label", text: "Recherche" }), search),
      el("div", { class: "filters__row" }, el("div", { class: "label", text: "Tag" }), select)
    )
  );
}
