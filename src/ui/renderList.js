import { el, clear } from "../utils/dom.js";

const INTERNAL_TAGS = new Set(["placeholder", "a_completer", "encadrement"]);

function matches(item, q) {
  if (!q) return true;
  const hay = `${item.display_name ?? ""} ${(item.tags ?? []).join(" ")}`.toLowerCase();
  return hay.includes(q.toLowerCase());
}

function visibleTags(tags) {
  return (tags ?? []).filter((t) => !INTERNAL_TAGS.has(t));
}

function isDraft(tags) {
  // Si la fiche n’a que des tags internes, on la considère "à venir"
  const vt = visibleTags(tags);
  return vt.length === 0;
}

export function renderList({ root, state, onSelect }) {
  clear(root);

  const filtered = state.index
    .filter((it) => (state.tag === "all" ? true : (it.tags ?? []).includes(state.tag)))
    .filter((it) => matches(it, state.query));

  if (filtered.length === 0) {
    root.appendChild(el("div", { class: "empty", text: "Aucun résultat. Ajuste la recherche ou le tag." }));
    return;
  }

  for (const item of filtered) {
    const vt = visibleTags(item.tags);
    const draft = isDraft(item.tags);

    const chips =
      vt.length > 0
        ? vt.slice(0, 6).map((t) => el("span", { class: "chip", text: t }))
        : [el("span", { class: "chip", text: "À venir" })];

    root.appendChild(
      el(
        "button",
        {
          class: `listItem ${state.selectedId === item.id ? "listItem--active" : ""}`,
          type: "button",
          onclick: () => onSelect(item.id)
        },
        el("div", { class: "listItem__title", text: item.display_name }),
        el("div", { class: "listItem__meta", text: item.one_liner ?? "" }),
        el("div", { class: "chips" }, ...chips)
      )
    );
  }
}
