import { el, clear } from "../utils/dom.js";
import { joinArr, range, safeText } from "../utils/format.js";

function resolveAlias(id, aliases) {
  return aliases?.[id] ?? id;
}

function nameById(id, index, aliases) {
  const direct = index.find((x) => x.id === id)?.display_name;
  if (direct) return direct;
  const resolved = resolveAlias(id, aliases);
  return index.find((x) => x.id === resolved)?.display_name ?? id;
}

function section(title, ...children) {
  return el("section", { class: "section" }, el("h2", { class: "section__title", text: title }), ...children);
}

function bulletList(items) {
  if (!Array.isArray(items) || items.length === 0) return el("div", { class: "muted", text: "—" });
  return el("ul", { class: "ul" }, ...items.map((x) => el("li", { text: x })));
}

function keyValue(rows) {
  const table = el("div", { class: "kv" });
  for (const [k, v] of rows) {
    table.appendChild(el("div", { class: "kv__k", text: k }));
    table.appendChild(el("div", { class: "kv__v", text: v }));
  }
  return table;
}

function pill(label, onClick) {
  return el("button", { class: "pill", type: "button", onclick: onClick }, label);
}

export function renderDetail({ root, entry, index, aliases, onSelect }) {
  clear(root);

  const header = el(
    "div",
    { class: "detailHeader" },
    el("h1", { class: "detailHeader__title", text: safeText(entry.display_name) }),
    entry.app_copy?.one_liner ? el("div", { class: "detailHeader__oneLiner", text: entry.app_copy.one_liner }) : null
  );

  root.appendChild(header);

  root.appendChild(
    section(
      "Identité",
      keyValue([
        ["ID", safeText(entry.id)],
        ["Pinyin", safeText(entry.pinyin)],
        ["Chinois", safeText(entry.chinese)],
        ["Latin", safeText(entry.latin)],
        ["Partie utilisée", safeText(entry.part_used)],
        ["Formes", joinArr(entry.forms)]
      ])
    )
  );

  const mtc = entry.mtc_profile ?? {};
  const coreActions = Array.isArray(mtc.core_actions) ? mtc.core_actions : [];

  root.appendChild(
    section(
      "Profil MTC",
      keyValue([
        ["Nature", safeText(mtc.nature)],
        ["Saveur", joinArr(mtc.flavor)],
        ["Méridiens", joinArr(mtc.meridians)]
      ]),
      coreActions.length
        ? el(
            "div",
            { class: "cards" },
            ...coreActions.map((a) =>
              el(
                "div",
                { class: "card" },
                el("div", { class: "card__title", text: a.action ?? "Action" }),
                (a.why_it_matters || a.why_itmatters)
                  ? el("div", { class: "card__body", text: a.why_it_matters ?? a.why_itmatters })
                  : null
              )
            )
          )
        : el("div", { class: "muted", text: "—" })
    )
  );

  root.appendChild(
    section(
      "Bénéfices",
      el(
        "div",
        { class: "twoCols" },
        el("div", {}, el("h3", { class: "h3", text: "Lecture MTC" }), bulletList(entry.benefits?.mtc_benefits)),
        el("div", {}, el("h3", { class: "h3", text: "Nutrition" }), bulletList(entry.benefits?.nutrition_benefits))
      )
    )
  );

  const solo = entry.effects?.solo_effects ?? {};
  root.appendChild(
    section(
      "Effets (solo)",
      el(
        "div",
        { class: "twoCols" },
        el("div", {}, el("h3", { class: "h3", text: "Primaires" }), bulletList(solo.primary)),
        el("div", {}, el("h3", { class: "h3", text: "Secondaires" }), bulletList(solo.secondary))
      ),
      section(
        "Temporalité",
        keyValue([
          ["Ressenti rapide", safeText(solo.onset?.felt_quickly)],
          ["Horizon typique", safeText(solo.onset?.typical_horizon)]
        ])
      )
    )
  );

  const blends = entry.effects?.blend_effects ?? [];
  if (Array.isArray(blends) && blends.length) {
    root.appendChild(
      section(
        "Synergies",
        el(
          "div",
          { class: "cards" },
          ...blends.map((b) => {
            const summary = b.combined_effects?.user_facing_summary ?? b.blend_id;
            const ids = (b.ingredients ?? []).map((x) => x.id).filter(Boolean);

            return el(
              "div",
              { class: "card" },
              el("div", { class: "card__title", text: summary }),
              b.best_use_cases?.length
                ? el("div", { class: "card__body" }, el("div", { class: "muted", text: "Cas d’usage" }), bulletList(b.best_use_cases))
                : null,
              el("div", { class: "pillRow" }, ...ids.map((id) => pill(nameById(id, index, aliases), () => onSelect(id))))
            );
          })
        )
      )
    );
  }

  const d = entry.dosage ?? {};
  root.appendChild(
    section(
      "Dosage",
      keyValue([
        ["MTC (g/j)", range(d.mtc_typical_range_g_per_day, " g")],
        ["Alimentaire (g/j)", range(d.food_use_typical_g_per_day, " g")],
        ["Portion pratique", safeText(d.practical_serving)],
        ["Fréquence", safeText(d.frequency)]
      ])
    )
  );

  const c = entry.consumption_and_cooking ?? {};
  const modes = c.modes ?? [];
  root.appendChild(
    section(
      "Consommation & cuisine",
      Array.isArray(c.golden_rules) && c.golden_rules.length
        ? el("div", {}, el("h3", { class: "h3", text: "Règles d’or" }), bulletList(c.golden_rules))
        : null,
      Array.isArray(modes) && modes.length
        ? el(
            "div",
            { class: "cards" },
            ...modes.map((m) =>
              el(
                "div",
                { class: "card" },
                el("div", { class: "card__title", text: safeText(m.display_name) }),
                m.how ? el("div", { class: "card__body", text: m.how }) : null,
                keyValue([
                  ["Dose", m.dose_g ? range(m.dose_g, " g") : "—"],
                  ["Température", m.water_temp_c ? range(m.water_temp_c, "°C") : m.simmer_temp_c ? range(m.simmer_temp_c, "°C") : "—"],
                  ["Temps", m.time_minutes ? range(m.time_minutes, " min") : "—"]
                ]),
                m.notes?.length ? el("div", {}, el("div", { class: "muted", text: "Notes" }), bulletList(m.notes)) : null,
                m.compatible_additions?.length
                  ? el(
                      "div",
                      {},
                      el("div", { class: "muted", text: "Ajouts compatibles" }),
                      el("div", { class: "pillRow" }, ...(m.compatible_additions ?? []).map((a) => pill(nameById(a.id, index, aliases), () => onSelect(a.id))))
                    )
                  : null
              )
            )
          )
        : el("div", { class: "muted", text: "—" })
    )
  );

  const q = entry.quality_and_selection ?? {};
  root.appendChild(
    section(
      "Qualité & sélection",
      el(
        "div",
        { class: "twoCols" },
        el("div", {}, el("h3", { class: "h3", text: "À rechercher" }), bulletList(q.what_to_look_for)),
        el("div", {}, el("h3", { class: "h3", text: "Stockage" }), keyValue([
          ["Conserver", safeText(q.storage?.keep)],
          ["Bonnes pratiques", safeText(q.storage?.best_practice ?? q.storage?.shelf_life_guidance)]
        ]))
      )
    )
  );

  const s = entry.safety ?? {};
  root.appendChild(
    section(
      "Sécurité",
      s.critical_warnings?.length ? el("div", {}, el("div", { class: "muted", text: "Alertes critiques" }), bulletList(s.critical_warnings)) : null,
      el(
        "div",
        { class: "twoCols" },
        el("div", {}, el("h3", { class: "h3", text: "Contre-indications (MTC)" }), bulletList(s.contraindications_mtc)),
        el("div", {}, el("h3", { class: "h3", text: "Interactions / notes" }),
          bulletList((s.drug_interactions ?? []).map((x) => `${x.risk ?? "Interaction"} : ${x.note ?? ""}`)),
          s.allergy_notes?.length ? el("div", {}, el("div", { class: "muted", text: "Allergies" }), bulletList(s.allergy_notes)) : null,
          s.pregnancy_and_special_populations ? el("div", {}, el("div", { class: "muted", text: "Populations spécifiques" }), el("div", { text: s.pregnancy_and_special_populations })) : null,
          s.metabolic_notes ? el("div", {}, el("div", { class: "muted", text: "Métabolique" }), el("div", { text: s.metabolic_notes })) : null
        )
      )
    )
  );

  if (entry.metadata?.related_entries?.length) {
    root.appendChild(
      section(
        "Associés",
        el("div", { class: "pillRow" }, ...entry.metadata.related_entries.map((id) => pill(nameById(id, index, aliases), () => onSelect(id))))
      )
    );
  }

  if (entry.sources?.length) {
    root.appendChild(
      section(
        "Sources",
        el(
          "div",
          { class: "cards" },
          ...entry.sources.map((src) =>
            el(
              "div",
              { class: "card" },
              el("div", { class: "card__title", text: src.label ?? src.type ?? "Source" }),
              src.note ? el("div", { class: "card__body", text: src.note }) : null
            )
          )
        )
      )
    );
  }

  root.appendChild(
    section(
      "Métadonnées",
      keyValue([
        ["Tags", joinArr(entry.metadata?.tags)],
        ["Dernière MAJ", safeText(entry.metadata?.last_updated)],
        ["Note de confiance", safeText(entry.metadata?.confidence_notes)]
      ])
    )
  );
}
