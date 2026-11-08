// ---------- Texto ----------
const ESC_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
export const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ESC_MAP[c]);

export const fold = (s) =>
  String(s ?? "")
    .split("")
    .map((c) => c.normalize("NFD").charAt(0).toLowerCase())
    .join("");

export const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "");
export const initials = (name) =>
  String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");

// ---------- Números y fechas ----------
export const nf = new Intl.NumberFormat("es-CO");
export const collator = new Intl.Collator("es", { numeric: true, sensitivity: "base" });
export const pct = (n, total) => (total ? Math.round((n / total) * 100) : 0);
export const plural = (n, one, many) => `${nf.format(n)} ${n === 1 ? one : many}`;

const pad = (n) => String(n).padStart(2, "0");
export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const parseISO = (s) => {
  const [y, m, d] = String(s).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
export const todayISO = () => toISO(new Date());
export const daysAgoISO = (n) => {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return toISO(d);
};
export const fmtDate = (s) =>
  s
    ? new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric" }).format(parseISO(s))
    : "";

export function timeAgo(ts) {
  const min = Math.floor(Math.max(0, Date.now() - ts) / 60000);
  if (min < 1) return "hace un momento";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "ayer";
  if (d < 7) return `hace ${d} días`;
  return fmtDate(toISO(new Date(ts)));
}

// ---------- Búsqueda con resaltado ----------
export function buildHighlightRanges(text, terms) {
  const s = String(text ?? "");
  if (!terms?.length || !s) return [];
  const f = fold(s);
  const ranges = [];
  terms.forEach((t) => {
    if (!t) return;
    let i = f.indexOf(t);
    while (i !== -1) {
      ranges.push([i, i + t.length]);
      i = f.indexOf(t, i + t.length);
    }
  });
  if (!ranges.length) return [];
  ranges.sort((a, b) => a[0] - b[0]);
  const merged = [ranges[0].slice()];
  for (let i = 1; i < ranges.length; i++) {
    const last = merged[merged.length - 1];
    if (ranges[i][0] <= last[1]) last[1] = Math.max(last[1], ranges[i][1]);
    else merged.push(ranges[i].slice());
  }
  return merged;
}

export function segments(text, terms) {
  const s = String(text ?? "");
  const ranges = buildHighlightRanges(s, terms);
  if (!ranges.length) return [{ text: s }];
  const out = [];
  let pos = 0;
  ranges.forEach(([a, b]) => {
    if (pos < a) out.push({ text: s.slice(pos, a) });
    out.push({ text: s.slice(a, b), mark: true });
    pos = b;
  });
  if (pos < s.length) out.push({ text: s.slice(pos) });
  return out;
}