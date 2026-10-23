/* Kiosk: map + search + filters + live results list + university popup + "About this map" dialog. Data comes from _data/ via acc.md. */
(() => {
const U = window.UNIVERSITIES || {};
const C = Object.fromEntries(Object.entries(window.COURSES || {}).map(([k, v]) => [k, Array.isArray(v) ? v : []]));
const $ = id => document.getElementById(id);
const h = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
const arr = v => Array.isArray(v) ? v : v ? [v] : [];
const plural = (k, w) => `${k} ${w}${k === 1 ? "" : "s"}`;
const ids = Object.keys(U), list = id => C[id] || [];
const all = ids.flatMap(list);
const meta = c => [c.qualification, arr(c.study_mode).join(" / ")].filter(Boolean).join(", ");
const btn = (cls, txt, fn) => { const b = h("button", cls, txt); b.type = "button"; b.onclick = fn; return b; };

/* searchable text per programme */
const hay = new WeakMap();
ids.forEach(id => list(id).forEach(c => hay.set(c,
  [c.name, c.summary, U[id].name, U[id].short, ...arr(c.subjects), ...arr(c.careers)].join(" ").toLowerCase())));

/* ?kiosk on the iPad URL turns on auto-reset and touch lock; visitors opening the QR link get a normal page */
const KIOSK = new URLSearchParams(location.search).has("kiosk");
if (KIOSK) document.documentElement.classList.add("lock");
const st = { topic: "", qual: "", q: "" };
let cur = null, sel = null, showAll = false, opener = null;
const match = c => (!st.topic || arr(c.subjects).includes(st.topic))
  && (!st.qual || c.qualification === st.qual)
  && st.q.split(/\s+/).filter(Boolean).every(w => hay.get(c).includes(w));
const dirty = () => st.topic || st.qual || st.q;

const stage = document.querySelector(".stage");
const drawer = $("drawer"), grab = $("grab"), dbody = $("dbody"), fbtn = $("fbtn"), lbtn = $("lbtn");
const portraitMQ = matchMedia("(max-aspect-ratio:1/1),(max-width:820px)");   /* keep in sync with booth.css */

/* ---------- results drawer (phone + iPad portrait) ---------- */
const PEEK_EM = 5.6;                                                          /* keep in sync with booth.css */
const setSheet = s => {
  drawer.dataset.state = s; stage.dataset.sheet = s; drawer.style.height = "";
  lbtn.textContent = s === "peek" ? "Show list" : "Hide list";
  lbtn.setAttribute("aria-expanded", s !== "peek");
};
const sheetHeights = () => {
  const fs = parseFloat(getComputedStyle(stage).fontSize) || 16;
  return { peek: fs * PEEK_EM + (parseFloat(getComputedStyle(drawer).paddingBottom) || 0), half: innerHeight * .46, full: innerHeight * .9 };
};
const toggleSheet = () => setSheet(drawer.dataset.state === "peek" ? "half" : "peek");
const setFilters = open => {
  drawer.classList.toggle("filt-open", open);
  fbtn.setAttribute("aria-expanded", open);
  if (open && portraitMQ.matches) setSheet("full");
  dbody.scrollTop = 0;
};
fbtn.onclick = () => setFilters(!drawer.classList.contains("filt-open"));
lbtn.onclick = toggleSheet;

let drag = null;
grab.addEventListener("pointerdown", e => {
  if (!portraitMQ.matches || e.target.closest("button")) return;
  drag = { y: e.clientY, h: drawer.offsetHeight, t: performance.now(), moved: false, id: e.pointerId };
  grab.setPointerCapture(e.pointerId);
  drawer.classList.add("drag");
});
grab.addEventListener("pointermove", e => {
  if (!drag) return;
  const dy = drag.y - e.clientY, H = sheetHeights();
  if (Math.abs(dy) > 6) drag.moved = true;
  if (drag.moved) drawer.style.height = Math.max(H.peek, Math.min(H.full, drag.h + dy)) + "px";
});
const endDrag = e => {
  if (!drag) return;
  const d = drag; drag = null;
  drawer.classList.remove("drag");
  if (!d.moved) { drawer.style.height = ""; toggleSheet(); return; }
  const H = sheetHeights(), dt = Math.max(1, performance.now() - d.t);
  const projected = drawer.offsetHeight + ((d.y - e.clientY) / dt) * 180;      /* flick carries it onward */
  const next = Object.keys(H).reduce((a, k) => Math.abs(H[k] - projected) < Math.abs(H[a] - projected) ? k : a, "peek");
  setSheet(next);
};
grab.addEventListener("pointerup", endDrag);
grab.addEventListener("pointercancel", endDrag);
addEventListener("resize", () => { if (!drag) drawer.style.height = ""; });
grab.tabIndex = 0; grab.setAttribute("role", "group");

/* ---------- filter chips ---------- */
const top = (f, n) => {
  const m = {}; all.forEach(c => f(c).forEach(v => m[v] = (m[v] || 0) + 1));
  return Object.keys(m).sort((a, b) => m[b] - m[a]).slice(0, n);
};
const chipRow = (el, key, vals, allLabel) => [["", allLabel], ...vals.map(v => [v, v])].forEach(([v, l]) => {
  const b = btn("", l, () => { st[key] = v; paint(); });
  b.dataset.k = key; b.dataset.v = v; $(el).append(b);
});
chipRow("quals", "qual", top(c => arr(c.qualification), 4), "All levels");
chipRow("topics", "topic", top(c => arr(c.subjects), 8), "All subjects");

const q = $("q");
q.oninput = () => {
  st.q = q.value.trim().toLowerCase(); paint();
  if (st.q && portraitMQ.matches && drawer.dataset.state === "peek") setSheet("half");   /* show what the search found */
};
q.onkeydown = e => { if (e.key === "Enter") q.blur(); };   /* hides the iPad keyboard */
const reset = () => { Object.assign(st, { topic: "", qual: "", q: "" }); q.value = ""; paint(); };
$("reset").onclick = reset;

/* ---------- map ---------- */
const map = $("map"), dots = {};
/* keep the map image's own proportions, whatever image is used */
const mapImg = map.querySelector("img");
const fitMap = () => mapImg.naturalWidth && map.style.setProperty("--r", mapImg.naturalWidth / mapImg.naturalHeight);
mapImg.complete ? fitMap() : mapImg.addEventListener("load", fitMap);
ids.forEach(id => {
  const u = U[id], d = h("button", "dot"); d.type = "button";
  d.style.cssText = `top:${u.map.top}%;left:${u.map.left}%;--c:${u.brand_color}`;
  d.append(h("span", "num"), h("span", "lb " + (u.label || "right"), u.short || u.name));
  d.onclick = () => openUni(id);
  dots[id] = d; map.append(d);
});

function paint() {
  document.querySelectorAll(".chips button").forEach(b => b.setAttribute("aria-pressed", st[b.dataset.k] === b.dataset.v));
  const res = $("results"); res.replaceChildren();
  let total = 0, unis = 0;
  ids.forEach(id => {
    const items = list(id).filter(match), n = items.length, d = dots[id];
    d.classList.toggle("empty", !n);
    d.querySelector(".num").textContent = n || "";
    d.setAttribute("aria-label", `${U[id].name}: ${n ? plural(n, "programme") : "no matching programmes"}`);
    total += n; unis += n > 0;
    if (!n) return;
    const g = h("section", "grp"); g.style.setProperty("--c", U[id].brand_color);
    g.append(h("h3", "", U[id].name));
    items.forEach(c => {
      const b = btn("row", c.name, () => openUni(id, c));
      b.append(h("small", "", meta(c)));
      b.onpointerenter = b.onfocus = () => dots[id].classList.add("hi");
      b.onpointerleave = b.onblur = () => dots[id].classList.remove("hi");
      g.append(b);
    });
    res.append(g);
  });
  if (!total) {
    const e = h("div", "none");
    e.append(h("p", "", "No programmes match. Try fewer words or clear the filters."), btn("bt", "Clear filters", reset));
    res.append(e);
  }
  dbody.scrollTop = 0; res.scrollTop = 0;
  $("tally").replaceChildren(h("strong", "", plural(total, "programme")), h("span", "sub", ` at ${unis === 1 ? "1 university" : unis + " universities"}`));
  $("reset").hidden = !dirty();
  stage.classList.toggle("filtered", !!dirty());
  const nf = (st.topic ? 1 : 0) + (st.qual ? 1 : 0), fc = $("fcount");
  fc.hidden = !nf; fc.textContent = nf;
}

/* ---------- popup ---------- */
const mdl = $("mdl");
const link = (cls, text, href) => { const a = h("a", cls, text); a.href = href; a.target = "_blank"; a.rel = "noopener"; return a; };
const sec = (title, node) => { const s = h("section"); s.append(h("h4", "", title), node); return s; };
const chips = items => { const d = h("div", "tags"); items.forEach(i => d.append(h("span", "", i))); return d; };

function openUni(id, course) {
  const u = U[id]; cur = id; showAll = false; sel = course || null;
  opener = document.activeElement;
  $("sheet").style.setProperty("--c", u.brand_color);
  $("m-head").style.backgroundImage = u.city_image ? `url("${u.city_image}")` : "";
  $("m-logo").hidden = !u.logo; if (u.logo) $("m-logo").src = u.logo;
  $("m-logo").alt = u.name + " logo";
  $("m-name").textContent = u.name;
  $("m-loc").textContent = u.location + (u.russell ? ", Russell Group" : "");
  renderList(); mdl.hidden = false; $("m-close").focus({ preventScroll: true });
}
function renderList() {
  const nav = $("m-list"), u = U[cur], full = list(cur), d = $("m-detail");
  let items = showAll || !dirty() ? full : full.filter(match);
  if (!items.length) items = full;
  nav.replaceChildren();
  nav.parentElement.classList.toggle("solo", full.length === 1);
  if (!full.length) {
    d.replaceChildren(h("h3", "", "Programmes coming soon"), h("p", "sum", `Programme details for ${u.name} will be added soon.`), link("bt", "Visit university website", u.website));
    return;
  }
  if (!items.includes(sel)) sel = items[0];
  items.forEach(c => {
    const b = btn("", c.name, () => { sel = c; renderList(); });
    b.append(h("small", "", meta(c)));
    b.setAttribute("aria-current", c === sel);
    nav.append(b);
  });
  if (items.length < full.length) nav.append(btn("all", `Show all ${full.length} programmes`, () => { showAll = true; renderList(); }));
  renderDetail(sel);
  nav.querySelector("[aria-current=true]")?.scrollIntoView({ block: "nearest", inline: "nearest" });
}
function deepLink(id, c) {
  const u = new URL(location.href); u.search = ""; u.hash = "";
  u.searchParams.set("u", id); if (c.id) u.searchParams.set("p", c.id);
  return u.toString();
}
function qrSvg(text) {
  const qr = qrcode(0, "M"); qr.addData(text); qr.make();
  const n = qr.getModuleCount(), NS = "http://www.w3.org/2000/svg"; let p = "";
  for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (qr.isDark(r, k)) p += `M${k} ${r}h1v1h-1z`;
  const s = document.createElementNS(NS, "svg"), path = document.createElementNS(NS, "path");
  s.setAttribute("viewBox", `0 0 ${n} ${n}`); s.setAttribute("role", "img"); s.setAttribute("aria-label", "QR code for this programme");
  s.setAttribute("shape-rendering", "crispEdges"); path.setAttribute("d", p); path.setAttribute("fill", "#16213a");
  s.append(path); return s;
}
function renderDetail(c) {
  const d = $("m-detail"); d.replaceChildren(); d.scrollTop = 0;
  const tbc = v => !v || /^tbc$/i.test(String(v).trim());
  const tg = h("div", "tags");
  [c.qualification, ...arr(c.study_mode), c.delivery !== "Other" ? c.delivery : ""].filter(Boolean).forEach((t, i) => tg.append(h("span", i ? "" : "q", t)));
  d.append(tg, h("h3", "", c.name));
  (c.summary || "")
  .trim()
  .split(/\n\s*\n/)
  .map(p => p.replace(/\n/g, " ").trim())
  .filter(Boolean)
  .forEach((p, i) => {
    d.append(h("p", "sum lead", p));
  });

const f = h("dl", "facts");

[["Duration", c.duration], ["Starts", c.dates], ["Apply by", c.deadline]].forEach(([k, v]) => {
  const x = h("div", tbc(v) ? "tbc" : "");
  const dd = h("dd");

  if (tbc(v)) {
    dd.textContent = "To be confirmed";
  } else if (k === "Apply by") {
    const blocks = String(v).trim().split(/\n\s*\n/).filter(Boolean);

    blocks.forEach(block => {
      const lines = block.split(/\n/).map(line => line.trim()).filter(Boolean);

      if (lines.every(line => line.startsWith("- "))) {
        const ul = h("ul", "deadline-list");
        lines.forEach(line => {
          ul.append(h("li", "", line.replace(/^-+\s*/, "")));
        });
        dd.append(ul);
      } else {
        dd.append(h("p", "", lines.join(" ")));
      }
    });
  } else {
    dd.textContent = v;
  }

  x.append(h("dt", "", k), dd);
  f.append(x);
});

d.append(f);

  const main = h("div", "main"), aux = h("aside", "aux");
  if (arr(c.highlights).length) { const ul = h("ul", "hl"); c.highlights.forEach(i => ul.append(h("li", "", i))); main.append(sec("Highlights", ul)); }
[["How it is taught", c.delivery_note], ["Entry requirements", c.entry_requirements]].forEach(([k, v]) => {
  if (!v) return;

  const t = h("div", "txt");

  v.trim()
    .split(/\n\s*\n/)
    .map(p => p.replace(/\n/g, " ").trim())
    .filter(Boolean)
    .forEach(p => t.append(h("p", "", p)));

  main.append(sec(k, t));
});

[c.notes, c.programme_note].forEach(n => {
  if (!n) return;

  n.trim()
    .split(/\n\s*\n/)
    .map(p => p.replace(/\n/g, " ").trim())
    .filter(Boolean)
    .forEach(p => main.append(h("p", "note", p)));
});

  /* portrait: the first link plus Share become a sticky action bar, the rest move into a "More links" section */
  const portrait = portraitMQ.matches;
  const phone = !KIOSK && matchMedia("(max-width:700px)").matches;       /* a visitor's own phone, not the booth iPad */
  const btns = h("div", "btns"), extra = [];
  [[c.programme_url, "View programme page", "bt"], [c.department_url, "Department", "bt o"], [c.promo_url, "More information", "bt o"], [c.video_url, "Watch video", "bt o"]]
    .forEach(([u, t, k]) => {
      if (!/^https?:/.test(u || "")) return;
      if (portrait && btns.children.length) extra.push(link("bt o", t, u));
      else btns.append(link(portrait ? "bt" : k, t, u));
    });
  const url = deepLink(cur, c);
  if (navigator.share && phone) btns.append(btn("bt o", "Share", () => navigator.share({ title: c.name, url }).catch(() => {})));
  if (btns.children.length) aux.append(btns);
  if (arr(c.subjects).length) aux.append(sec("Subject areas", chips(c.subjects)));
  if (arr(c.careers).length) aux.append(sec("Career pathways", chips(c.careers)));
  if (extra.length) { const m = h("div", "morelinks"); m.append(...extra); aux.append(sec("More links", m)); }
  if (window.qrcode && !phone) try {
    /* the QR opens the university's own programme page; only if there is none does it fall back to the department page, then the map link */
    const qrUrl = [c.programme_url, c.department_url].find(u => /^https?:/.test(u || "")) || url;
    const w = h("div", "qr"); w.append(qrSvg(qrUrl), h("p", "", "Scan with your phone camera to open the programme page."));
    aux.append(sec("Take it with you", w));
  } catch (e) {}
  const cols = h("div", "cols"); cols.append(main, aux); d.append(cols);
}
const close = () => {
  mdl.hidden = true;
  const o = opener; opener = null;
  if (o && o.isConnected && o !== document.body) o.focus({ preventScroll: true });
};
$("m-close").onclick = close;
mdl.addEventListener("click", e => { if (e.target === mdl) close(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });

/* swipe the popup header down to dismiss (portrait only) */
const sheetEl = $("sheet"), mhead = $("m-head");
let md = null;
mhead.addEventListener("pointerdown", e => {
  if (!portraitMQ.matches || e.target.closest("button")) return;
  md = { y: e.clientY, t: performance.now() };
  mhead.setPointerCapture(e.pointerId); sheetEl.style.transition = "none";
});
mhead.addEventListener("pointermove", e => { if (md) sheetEl.style.transform = `translateY(${Math.max(0, e.clientY - md.y)}px)`; });
const endSwipe = e => {
  if (!md) return;
  const dy = Math.max(0, e.clientY - md.y), v = dy / Math.max(1, performance.now() - md.t); md = null;
  sheetEl.style.transition = ""; sheetEl.style.transform = "";
  if (dy > 120 || v > .6) close();
};
mhead.addEventListener("pointerup", endSwipe);
mhead.addEventListener("pointercancel", endSwipe);

/* ---------- "About this map" dialog (how to read the map, SC26 disclaimer, CAKE + QR) ---------- */
const about = $("about"), CAKE_URL = "https://www.cake.ac.uk/";
let aboutOpener = null;
const openAbout = () => {
  aboutOpener = document.activeElement;
  const box = $("about-qr"), phone = !KIOSK && matchMedia("(max-width:700px)").matches;   /* no QR on a visitor's own phone: they can just tap the button */
  if (window.qrcode && !phone && !box.querySelector("svg")) try {
    const s = qrSvg(CAKE_URL); s.setAttribute("aria-label", "QR code for the CAKE website");
    box.prepend(s); box.hidden = false;
  } catch (e) {}
  about.hidden = false; $("about-close").focus({ preventScroll: true });
};
const closeAbout = () => {
  if (about.hidden) return;
  about.hidden = true;
  const o = aboutOpener; aboutOpener = null;
  if (o && o.isConnected && o !== document.body) o.focus({ preventScroll: true });
};
$("mapinfo").onclick = openAbout;
$("about-close").onclick = closeAbout;
about.addEventListener("click", e => { if (e.target === about) closeAbout(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") closeAbout(); });
/* on the booth iPad, don't open a new tab: show the dialog, which has the QR code */
$("cake").addEventListener("click", e => { if (KIOSK) { e.preventDefault(); openAbout(); } });

/* ---------- kiosk: reset after 90 s without a touch ---------- */
let idle;
const home = () => { close(); closeAbout(); q.blur(); reset(); setFilters(false); setSheet("peek"); };
const bump = () => { clearTimeout(idle); idle = setTimeout(home, 90000); };
if (KIOSK) { ["pointerdown", "keydown", "scroll"].forEach(e => document.addEventListener(e, bump, true)); bump(); }
setSheet("peek");
paint();
/* QR / shared link: ?u=<university>&p=<programme> opens that programme directly */
const qs = new URLSearchParams(location.search), du = qs.get("u");
if (du && U[du]) openUni(du, list(du).find(c => c.id === qs.get("p")));
})();