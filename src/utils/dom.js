export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);

  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined) continue;
    if (k === "class") node.className = String(v);
    else if (k === "text") node.textContent = String(v);
    else if (k.startsWith("on") && typeof v === "function") {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else {
      node.setAttribute(k, String(v));
    }
  }

  for (const child of children) {
    if (child === null || child === undefined) continue;
    if (typeof child === "string") node.appendChild(document.createTextNode(child));
    else node.appendChild(child);
  }

  return node;
}

export function clear(node) {
  node.innerHTML = "";
}
