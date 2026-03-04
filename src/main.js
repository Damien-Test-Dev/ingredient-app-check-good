import "./styles.css";
import { state } from "./state.js";
import { getRouteId, navigateToIngredient } from "./router.js";
import { loadIndex, loadAliases, loadIngredientEntryById } from "./services/dataService.js";
import { renderFilters } from "./ui/renderFilters.js";
import { renderList } from "./ui/renderList.js";
import { renderDetail } from "./ui/renderDetail.js";

const $filters = document.querySelector("#filters");
const $list = document.querySelector("#list");
const $detail = document.querySelector("#detail");

function resolveId(id) {
  if (state.index.some((x) => x.id === id)) return id;
  const aliased = state.aliases?.[id];
  if (aliased && state.index.some((x) => x.id === aliased)) return aliased;
  return id;
}

async function selectIngredient(id) {
  const resolved = resolveId(id);
  state.selectedId = resolved;
  navigateToIngredient(resolved);

  state.selectedEntry = await loadIngredientEntryById(resolved, state.index);

  renderList({ root: $list, state, onSelect: selectIngredient });
  renderDetail({
    root: $detail,
    entry: state.selectedEntry,
    index: state.index,
    aliases: state.aliases,
    onSelect: selectIngredient
  });
}

function rerenderListOnly() {
  renderList({ root: $list, state, onSelect: selectIngredient });
}

async function handleRoute() {
  const id = getRouteId();
  if (id) {
    await selectIngredient(id);
    return;
  }
  if (state.index[0]) await selectIngredient(state.index[0].id);
}

async function init() {
  state.aliases = await loadAliases();
  state.index = await loadIndex();

  renderFilters({ root: $filters, state, onChange: rerenderListOnly });
  renderList({ root: $list, state, onSelect: selectIngredient });

  window.addEventListener("hashchange", () => {
    handleRoute().catch(console.error);
  });

  await handleRoute();
}

init().catch((err) => {
  console.error(err);
  $detail.innerHTML = `<div class="empty">Erreur de chargement. Vérifie /public/data.</div>`;
});
