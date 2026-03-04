export function joinArr(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return "—";
  return arr.join(", ");
}

export function range(obj, unit = "") {
  if (!obj || typeof obj !== "object") return "—";
  const min = obj.min ?? "—";
  const max = obj.max ?? "—";
  return `${min}–${max}${unit}`;
}

export function safeText(v) {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
}
