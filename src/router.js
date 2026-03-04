export function getRouteId() {
  const hash = window.location.hash || "";
  const parts = hash.replace(/^#\/?/, "").split("/");
  if (parts[0] === "ingredient" && parts[1]) return decodeURIComponent(parts[1]);
  return null;
}

export function navigateToIngredient(id) {
  window.location.hash = `#/ingredient/${encodeURIComponent(id)}`;
}
