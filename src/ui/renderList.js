import { el, clear } from "../utils/dom.js";

function matches(item, q) {
  if (!q) return true;
  const hay = `${item.display_name ?? ""} ${(item.tags ?? []).join(" ")}`.toLowerCase();
  return hay.includes(q.toLowerCase());
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
        el("div", { class: "chips" }, ...((item.tags ?? []).slice(0, 6).map((t) => el("span", { class: "chip", text: t }))))
      )
    );
  }
}
