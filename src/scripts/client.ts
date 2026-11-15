type Lang = "en" | "id";

const SECTION_DEFS: { id: string; en: string; id_: string }[] = [
  { id: "top",      en: "Hero",         id_: "Hero" },
  { id: "services", en: "Services",     id_: "Layanan" },
  { id: "compare",  en: "Regular vs deep", id_: "Rutin vs deep" },
  { id: "pricing",  en: "Pricing",      id_: "Harga" },
  { id: "how",      en: "How it works", id_: "Cara kerja" },
  { id: "why",      en: "Why us",       id_: "Mengapa" },
  { id: "reviews",  en: "Reviews",      id_: "Ulasan" },
  { id: "area",     en: "Service area", id_: "Area" },
  { id: "faq",      en: "FAQ",          id_: "FAQ" },
  { id: "book",     en: "Book online",  id_: "Booking online" },
  { id: "contact",  en: "Book now",     id_: "Pesan" },
];

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const yrEl = document.getElementById("yr");
if (yrEl) yrEl.textContent = String(new Date().getFullYear());

/* ---------- Sticky header shadow ---------- */
const header = document.getElementById("siteHeader");
if (header) {
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 6);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---------- Mobile drawer ---------- */
const drawer = document.getElementById("mobileDrawer");
const menuBtn = document.getElementById("menuBtn");
const closeDrawer = document.getElementById("closeDrawer");
if (drawer && menuBtn && closeDrawer) {
  menuBtn.addEventListener("click", () => drawer.classList.add("open"));
  closeDrawer.addEventListener("click", () => drawer.classList.remove("open"));
  drawer.addEventListener("click", (e) => { if (e.target === drawer) drawer.classList.remove("open"); });
  drawer.querySelectorAll("a").forEach(a => a.addEventListener("click", () => drawer.classList.remove("open")));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") drawer.classList.remove("open");
  });
}

/* ---------- Language toggle ---------- */
let currentLang: Lang;
function getInitialLang(): Lang {
  const stored = localStorage.getItem("goclean.lang");
  if (stored === "id" || stored === "en") return stored;
  return (navigator.language || "en").toLowerCase().startsWith("id") ? "id" : "en";
}

function applyLang(l: Lang) {
  currentLang = l;
  document.documentElement.lang = l;
  document.querySelectorAll<HTMLElement>("[data-en][data-id]").forEach(el => {
    const txt = el.getAttribute("data-" + l);
    if (txt == null) return;
    if (el.tagName === "OPTION") { el.textContent = txt; return; }
    const hasOnlyText = Array.from(el.childNodes).every(n => n.nodeType === 3);
    if (hasOnlyText) {
      el.textContent = txt;
    } else {
      const firstText = Array.from(el.childNodes).find(n => n.nodeType === 3);
      if (firstText) firstText.nodeValue = txt;
      else el.textContent = txt;
    }
  });
  document.querySelectorAll<HTMLElement>("[data-lang-btn]").forEach(b => {
    b.classList.toggle("active", b.getAttribute("data-lang-btn") === l);
  });
  localStorage.setItem("goclean.lang", l);
}

/* ---------- FAQ accordion ---------- */
document.querySelectorAll<HTMLElement>(".faq-item").forEach(item => {
  const btn = item.querySelector<HTMLButtonElement>(".faq-q");
  const answer = item.querySelector<HTMLElement>(".faq-a");
  if (!btn || !answer) return;
  btn.addEventListener("click", () => {
    const open = item.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    answer.style.maxHeight = open ? answer.scrollHeight + "px" : "0px";
  });
});

/* ---------- Reveal on scroll ---------- */
const revealIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("in");
      revealIO.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
document.querySelectorAll(".reveal, .reveal-stagger").forEach(el => revealIO.observe(el));

/* ---------- Form → WhatsApp ---------- */
const WA_NUMBER = "6287864573925";
const bookForm = document.getElementById("bookForm") as HTMLFormElement | null;
if (bookForm) {
  bookForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = bookForm;
    const name = ((f.elements.namedItem("name") as HTMLInputElement)?.value || "").trim() || "—";
    const area = (f.elements.namedItem("area") as HTMLSelectElement)?.value || "";
    const villa = (f.elements.namedItem("villa") as HTMLSelectElement)?.value || "";
    const service = (f.elements.namedItem("service") as HTMLSelectElement)?.value || "";
    const date = (f.elements.namedItem("date") as HTMLInputElement)?.value || "—";
    const time = (f.elements.namedItem("time") as HTMLSelectElement)?.value || "";
    const notes = ((f.elements.namedItem("notes") as HTMLTextAreaElement)?.value || "").trim();

    const lines = currentLang === "id"
      ? [
          "Halo GoClean! Saya ingin booking:",
          "",
          "Nama: " + name,
          "Area: " + area,
          "Ukuran villa: " + villa,
          "Layanan: " + service,
          "Tanggal: " + date,
          "Waktu: " + time,
          notes ? "Catatan: " + notes : "",
        ]
      : [
          "Hi GoClean! I'd like to book:",
          "",
          "Name: " + name,
          "Area: " + area,
          "Villa size: " + villa,
          "Service: " + service,
          "Date: " + date,
          "Time: " + time,
          notes ? "Notes: " + notes : "",
        ];
    const msg = lines.filter(Boolean).join("\n");
    const url = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg);
    window.open(url, "_blank", "noopener");
  });
}

/* ---------- Sections in view ---------- */
const SECTIONS = SECTION_DEFS
  .map(s => ({ ...s, el: document.getElementById(s.id) }))
  .filter((s): s is typeof s & { el: HTMLElement } =>
    !!s.el && getComputedStyle(s.el).display !== "none");

if (!reduceMotion && innerWidth >= 900) {
  document.documentElement.classList.add("snap-on");
}

const scTotalEl = document.getElementById("scTotal");
const scNumEl = document.getElementById("scNum");
const scNameEl = document.getElementById("scName");
if (scTotalEl) scTotalEl.textContent = String(SECTIONS.length).padStart(2, "0");

let activeIdx = 0;
const setActive = (idx: number) => {
  if (idx === activeIdx) return;
  activeIdx = idx;
  if (scNumEl) scNumEl.textContent = String(idx + 1).padStart(2, "0");
  if (scNameEl) {
    const s = SECTIONS[idx];
    scNameEl.textContent = currentLang === "id" ? s.id_ : s.en;
  }
};

const sectionIO = new IntersectionObserver((entries) => {
  let best: IntersectionObserverEntry | null = null;
  entries.forEach(e => {
    if (e.isIntersecting && (!best || e.intersectionRatio > best.intersectionRatio)) best = e;
  });
  if (best) {
    const idx = SECTIONS.findIndex(s => s.el === (best as IntersectionObserverEntry).target);
    if (idx >= 0) setActive(idx);
  }
}, { threshold: [0.25, 0.5, 0.75], rootMargin: "-20% 0px -40% 0px" });
SECTIONS.forEach(s => sectionIO.observe(s.el));

/* ---------- Scroll progress ---------- */
const progressEl = document.getElementById("scrollProgress");
if (progressEl) {
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    progressEl.style.width = pct + "%";
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();
}

/* ---------- Word reveal on H2 ---------- */
const h2Cache = new Map<HTMLElement, string>();

function wrapWords(h: HTMLElement) {
  if (h.classList.contains("word-reveal")) return;
  const children = Array.from(h.childNodes);
  h.innerHTML = "";
  let wordIdx = 0;
  const addWord = (parent: Node, part: string) => {
    if (/^\s+$/.test(part)) {
      parent.appendChild(document.createTextNode(part));
    } else if (part.length) {
      const w = document.createElement("span");
      w.className = "w";
      w.style.setProperty("--d", (wordIdx * 60) + "ms");
      w.textContent = part;
      parent.appendChild(w);
      wordIdx++;
    }
  };
  children.forEach(node => {
    if (node.nodeType === 1) {
      const el = (node as HTMLElement).cloneNode(false) as HTMLElement;
      const text = node.textContent || "";
      text.split(/(\s+)/).forEach(part => addWord(el, part));
      h.appendChild(el);
      h.appendChild(document.createTextNode(" "));
    } else if (node.nodeType === 3) {
      const text = node.textContent || "";
      text.split(/(\s+)/).forEach(part => addWord(h, part));
    }
  });
  h.classList.add("word-reveal");
  const r = h.getBoundingClientRect();
  if (r.top < window.innerHeight && r.bottom > 0) {
    h.classList.add("in");
  }
}

const wordHeads = Array.from(
  document.querySelectorAll<HTMLElement>(".section-head h2")
);
const wrIO = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add("in");
      wrIO.unobserve(e.target);
    }
  });
}, { threshold: 0.3 });

/* ---------- Language toggle wiring (uses word-reveal cache) ---------- */
document.querySelectorAll<HTMLButtonElement>("[data-lang-btn]").forEach(b => {
  // Capture: restore clean H2 structure BEFORE applyLang runs.
  b.addEventListener("click", () => {
    wordHeads.forEach(h => {
      const orig = h2Cache.get(h);
      if (orig != null) {
        h.classList.remove("word-reveal", "in");
        h.innerHTML = orig;
      }
    });
  }, true);
  // Bubble: re-wrap, refresh counter name.
  b.addEventListener("click", () => {
    const l = b.getAttribute("data-lang-btn") as Lang;
    applyLang(l);
    setTimeout(() => {
      wordHeads.forEach(h => {
        wrapWords(h);
        h.classList.add("in");
      });
      if (scNameEl) {
        const s = SECTIONS[activeIdx] || SECTIONS[0];
        if (s) scNameEl.textContent = l === "id" ? s.id_ : s.en;
      }
    }, 0);
  });
});

applyLang(getInitialLang());

/* Wrap words AFTER initial language application, so the cached H2 structure
   is the current-language clean form. Then observe for in-view reveal. */
wordHeads.forEach(h => {
  h2Cache.set(h, h.innerHTML);
  wrapWords(h);
});
document.querySelectorAll(".word-reveal").forEach(el => wrIO.observe(el));

/* ---------- Cursor accent ---------- */
(function setupCursor(){
  if (matchMedia("(hover: none), (pointer: coarse), (prefers-reduced-motion: reduce)").matches) return;
  const c = document.getElementById("cursorAccent");
  if (!c) return;
  let tx = 0, ty = 0, x = 0, y = 0;
  let raf: number | null = null;
  let visible = false;
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const tick = () => {
    x = lerp(x, tx, 0.18); y = lerp(y, ty, 0.18);
    c.style.transform = "translate(" + x + "px," + y + "px) translate(-50%,-50%)";
    raf = requestAnimationFrame(tick);
  };
  document.addEventListener("mousemove", (e) => {
    tx = e.clientX; ty = e.clientY;
    if (!visible) { c.classList.add("visible"); visible = true; }
    if (raf === null) tick();
  });
  document.addEventListener("mouseleave", () => { c.classList.remove("visible"); visible = false; });
  const hot = "a, button, summary, input, textarea, select, [role=button]";
  document.addEventListener("mouseover", (e) => {
    if ((e.target as HTMLElement)?.closest?.(hot)) c.classList.add("hot");
  });
  document.addEventListener("mouseout", (e) => {
    if ((e.target as HTMLElement)?.closest?.(hot)) c.classList.remove("hot");
  });
})();
