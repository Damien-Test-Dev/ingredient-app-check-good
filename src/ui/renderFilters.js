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
  // Nettoyage + sécurité si renderFilters est rappelé un jour
  if (root._ddCleanup) root._ddCleanup();
  clear(root);

  const tags = collectTagsWithCounts(state.index);
  const totalCount = state.index.length;

  const allOption = { tag: "all", label: "Tous les ingrédients", count: totalCount };
  const options = [allOption, ...tags];

  const current = options.find((o) => o.tag === state.tag) ?? allOption;

  // Recherche globale (liste ingrédients)
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

  // Dropdown custom (tags)
  const dd = el("div", { class: "dd" });
  const valueLabel = el("span", { class: "dd__value", text: `${current.label} (${current.count})` });
  const chevron = el("span", { class: "dd__chevron", text: "▾" });

  const trigger = el(
    "button",
    {
      class: "dd__trigger",
      type: "button",
      "aria-haspopup": "listbox",
      "aria-expanded": "false",
      onclick: () => toggle()
    },
    valueLabel,
    chevron
  );

  const menu = el("div", { class: "dd__menu", role: "listbox" });

  const tagSearch = el("input", {
    class: "input dd__search",
    type: "search",
    placeholder: "Filtrer les tags…"
  });

  const list = el("div", { class: "dd__list" });

  function setValueText(tagValue) {
    const selected = options.find((o) => o.tag === tagValue) ?? allOption;
    valueLabel.textContent = `${selected.label} (${selected.count})`;
  }

  function renderOptions(filterText = "") {
    list.innerHTML = "";
    const q = filterText.trim().toLowerCase();

    const filtered = options.filter((o) => {
      if (o.tag === "all") return true; // toujours visible
      if (!q) return true;
      return o.label.toLowerCase().includes(q) || o.tag.toLowerCase().includes(q);
    });

    for (const o of filtered) {
      const isSelected = (state.tag ?? "all") === o.tag;

      const left = el(
        "div",
        { class: "dd__left" },
        isSelected ? el("span", { class: "dd__check", text: "✓" }) : el("span", { class: "dd__check dd__check--empty", text: " " }),
        el("span", { class: `dd__label ${o.tag === "all" ? "dd__label--primary" : ""}`, text: o.label })
      );

      const right = el("span", { class: "dd__count", text: String(o.count) });

      const btn = el(
        "button",
        {
          class: `dd__option ${isSelected ? "is-selected" : ""}`,
          type: "button",
          onclick: () => {
            state.tag = o.tag;
            setValueText(o.tag);
            close();
            onChange();
          }
        },
        left,
        right
      );

      list.appendChild(btn);
    }
  }

  function open() {
    dd.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");
    tagSearch.value = "";
    renderOptions("");
    // focus utile mais pas agressif
    setTimeout(() => tagSearch.focus(), 0);
  }

  function close() {
    dd.classList.remove("is-open");
    trigger.setAttribute("aria-expanded", "false");
  }

  function toggle() {
    if (dd.classList.contains("is-open")) close();
    else open();
  }

  // Recherche dans les tags
  tagSearch.addEventListener("input", (e) => {
    renderOptions(e.target.value);
  });

  // Close on outside click + Escape
  const onDocClick = (e) => {
    if (!dd.contains(e.target)) close();
  };
  const onDocKeydown = (e) => {
    if (e.key === "Escape") close();
  };

  document.addEventListener("click", onDocClick);
  document.addEventListener("keydown", onDocKeydown);

  root._ddCleanup = () => {
    document.removeEventListener("click", onDocClick);
    document.removeEventListener("keydown", onDocKeydown);
  };

  // Build
  menu.appendChild(tagSearch);
  menu.appendChild(list);
  dd.appendChild(trigger);
  dd.appendChild(menu);

  // init options
  renderOptions("");

  const wrap = el(
    "div",
    { class: "filters" },
    el("div", { class: "filters__row" }, el("div", { class: "label", text: "Recherche" }), search),
    el("div", { class: "filters__row" }, el("div", { class: "label", text: "Tag" }), dd)
  );

  root.appendChild(wrap);
}
