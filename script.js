const FALLBACK_DATA = {
  skills: [
    { name: "HTML5 / CSS3" },
    { name: "JavaScript" },
    { name: "Node.js" },
    { name: "Express.js" },
    { name: "React.js" },
    { name: "MongoDB" }
  ],
  services: [],
  certificates: [],
  projects: [
    {
      id: "pharmacare-pro",
      title: "PharmaCare Pro",
      category: "Frontend",
      year: 2025,
      status: "Completed",
      shortDescription: "Pharmacy management system with inventory alerts and digital prescription generation.",
      description: "PharmaCare Pro is a pharmacy-management concept built to demonstrate a complete workflow for handling medicine inventory and prescriptions through a clean, responsive interface.",
      features: ["Inventory dashboard with low-stock and expiry alerts", "Digital prescription generator"],
      techStack: ["HTML5", "CSS3", "JavaScript"],
      demoLink: "https://royelnath.github.io/PharmaCare-Pro/",
      codeLink: "https://github.com/royelnath/PharmaCare-Pro"
    }
  ]
};

let SITE_DATA = null;
let activeCategory = "All";
let searchTerm = "";

// ---- Small helper: escape any text before it goes into innerHTML ----
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

// =========================
// THEME TOGGLE
// =========================
function setupThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  if (!themeToggle) return;
  const body = document.body;
  themeToggle.addEventListener("click", () => {
    const isDark = body.getAttribute("data-theme") === "dark";
    body.setAttribute("data-theme", isDark ? "light" : "dark");
    themeToggle.textContent = isDark ? "🌙 Mode" : "☀️ Light";
  });
}

// =========================
// MOBILE NAV TOGGLE
// =========================
function setupNavToggle() {
  const toggleBtn = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (!toggleBtn || !links) return;
  toggleBtn.addEventListener("click", () => {
    links.classList.toggle("open");
  });
  // Collapse the menu once a link is chosen (the page navigates away anyway,
  // but this keeps things tidy if navigation is ever intercepted/cached)
  links.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => links.classList.remove("open"));
  });
}

// =========================
// SKILLS (data-driven)
// =========================
function renderSkills(skills) {
  const container = document.getElementById("skillsContainer");
  if (!container) return;
  container.innerHTML = (skills || [])
    .map((s) => `<div class="skill-tag">${escapeHtml(s.name)}</div>`)
    .join("");
}

// =========================
// SERVICES (data-driven)
// =========================
function renderServices(services) {
  const container = document.getElementById("servicesContainer");
  if (!container) return;
  if (!services || services.length === 0) {
    container.innerHTML = "";
    return;
  }
  container.innerHTML = services
    .map(
      (s) => `
      <div class="card service-card">
        <i class="${escapeHtml(s.icon || "fa-solid fa-star")}" style="font-size:1.8rem;color:var(--primary-color);margin-bottom:15px;display:block;"></i>
        <h3>${escapeHtml(s.title)}</h3>
        <p style="color:var(--text-muted);margin-top:12px;">${escapeHtml(s.description)}</p>
      </div>`
    )
    .join("");
}

// =========================
// CERTIFICATES (data-driven)
// =========================
function renderCertificates(certificates) {
  const container = document.getElementById("certificatesContainer");
  const noCertificates = document.getElementById("noCertificates");
  if (!container) return;

  if (!certificates || certificates.length === 0) {
    container.innerHTML = "";
    if (noCertificates) noCertificates.style.display = "block";
    return;
  }
  if (noCertificates) noCertificates.style.display = "none";

  container.innerHTML = certificates.map(certificateCardHtml).join("");
}

function certificateCardHtml(c) {
  const thumb = c.image
    ? `<div class="project-thumb"><img src="${escapeHtml(c.image)}" alt="${escapeHtml(c.title)} certificate" loading="lazy" onerror="this.parentElement.outerHTML='<div class=&quot;project-thumb project-thumb-placeholder&quot;><i class=&quot;fa-solid fa-certificate&quot;></i></div>'"></div>`
    : `<div class="project-thumb project-thumb-placeholder"><i class="fa-solid fa-certificate"></i></div>`;

  const viewBtn = c.credentialUrl
    ? `<a href="${escapeHtml(c.credentialUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="padding:8px 16px;font-size:0.9rem;"><i class="fa-solid fa-arrow-up-right-from-square"></i> View Credential</a>`
    : `<span class="btn btn-disabled" style="padding:8px 16px;font-size:0.9rem;" title="No credential link yet">No link yet</span>`;

  return `
    <div class="card cert-card">
      ${thumb}
      <h3>${escapeHtml(c.title)}</h3>
      <p class="cert-meta">${escapeHtml(c.issuer || "")}${c.date ? ` &middot; ${escapeHtml(c.date)}` : ""}</p>
      <div class="project-actions" style="justify-content:center;">${viewBtn}</div>
    </div>`;
}

// =========================
// PROJECTS (data-driven, searchable + filterable)
// =========================
function projectMatches(project, term, category) {
  const inCategory = category === "All" || project.category === category;
  if (!inCategory) return false;
  if (!term) return true;
  const haystack = [
    project.title,
    project.shortDescription,
    project.description,
    project.category,
    ...(project.techStack || [])
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(term.toLowerCase());
}

function renderProjects() {
  const container = document.getElementById("projectsContainer");
  const noResults = document.getElementById("noResults");
  if (!container || !SITE_DATA) return;

  const filtered = (SITE_DATA.projects || []).filter((p) =>
    projectMatches(p, searchTerm, activeCategory)
  );

  if (filtered.length === 0) {
    container.innerHTML = "";
    if (noResults) noResults.style.display = "block";
    return;
  }
  if (noResults) noResults.style.display = "none";

  container.innerHTML = filtered.map((p) => projectCardHtml(p)).join("");

  // Wire up clicks after rendering
  container.querySelectorAll(".project-card").forEach((cardEl) => {
    const id = cardEl.getAttribute("data-id");
    cardEl.addEventListener("click", () => {
      const project = SITE_DATA.projects.find((p) => p.id === id);
      if (project) openProjectModal(project);
    });
  });
  // Demo/Code buttons inside cards should not trigger the modal
  container.querySelectorAll(".project-actions a").forEach((a) => {
    a.addEventListener("click", (e) => e.stopPropagation());
  });
}

function projectCardHtml(p) {
  const techBadges = (p.techStack || [])
    .map((t) => `<span class="tech-badge">${escapeHtml(t)}</span>`)
    .join("");

  const thumb = p.image
    ? `<div class="project-thumb"><img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)} preview" loading="lazy" onerror="this.parentElement.outerHTML='<div class=&quot;project-thumb project-thumb-placeholder&quot;><i class=&quot;fa-solid fa-image&quot;></i></div>'"></div>`
    : `<div class="project-thumb project-thumb-placeholder"><i class="fa-solid fa-code"></i></div>`;

  const demoBtn = p.demoLink
    ? `<a href="${escapeHtml(p.demoLink)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary" style="padding:8px 16px;font-size:0.9rem;"><i class="fa-solid fa-arrow-up-right-from-square"></i> Live Demo</a>`
    : `<span class="btn btn-disabled" style="padding:8px 16px;font-size:0.9rem;" title="No live demo yet">Demo coming soon</span>`;

  const codeBtn = p.codeLink
    ? `<a href="${escapeHtml(p.codeLink)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline" style="padding:8px 16px;font-size:0.9rem;margin-left:0;"><i class="fa-brands fa-github"></i> Code</a>`
    : "";

  return `
    <div class="card project-card" data-id="${escapeHtml(p.id)}">
      ${thumb}
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
        <h3>${escapeHtml(p.title)}</h3>
        <span class="tech-badge" style="white-space:nowrap;">${escapeHtml(p.category)}</span>
      </div>
      <p style="color: var(--text-muted); margin: 15px 0;">${escapeHtml(p.shortDescription)}</p>
      <div style="margin-bottom:15px;">${techBadges}</div>
      <div class="project-actions">${demoBtn}${codeBtn}</div>
      <p style="color:var(--text-muted);font-size:0.8rem;margin-top:12px;">Click card for full details →</p>
    </div>`;
}

// ---- Category filter pills, built from whatever categories exist in the data ----
function renderFilterPills() {
  const wrap = document.getElementById("filterPills");
  if (!wrap || !SITE_DATA) return;

  const categories = ["All", ...new Set((SITE_DATA.projects || []).map((p) => p.category))];

  wrap.innerHTML = categories
    .map(
      (c) =>
        `<button type="button" class="filter-btn${c === activeCategory ? " active" : ""}" data-category="${escapeHtml(c)}">${escapeHtml(c)}</button>`
    )
    .join("");

  wrap.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeCategory = btn.getAttribute("data-category");
      wrap.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderProjects();
    });
  });
}

function setupSearch() {
  const input = document.getElementById("projectSearch");
  if (!input) return;
  input.addEventListener("input", (e) => {
    searchTerm = e.target.value.trim();
    renderProjects();
  });
}

// =========================
// PROJECT DETAIL MODAL
// =========================
function openProjectModal(p) {
  const modal = document.getElementById("projectModal");
  const body = document.getElementById("modalBody");
  if (!modal || !body) return;

  const features = (p.features || [])
    .map((f) => `<li>${escapeHtml(f)}</li>`)
    .join("");
  const techBadges = (p.techStack || [])
    .map((t) => `<span class="tech-badge">${escapeHtml(t)}</span>`)
    .join("");

  const modalThumb = p.image
    ? `<div class="modal-thumb"><img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)} preview" onerror="this.parentElement.style.display='none'"></div>`
    : "";

  const demoBtn = p.demoLink
    ? `<a href="${escapeHtml(p.demoLink)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary"><i class="fa-solid fa-arrow-up-right-from-square"></i> Live Demo</a>`
    : `<span class="btn btn-disabled" title="No live demo yet">Demo comming soon</span>`;
  const codeBtn = p.codeLink
    ? `<a href="${escapeHtml(p.codeLink)}" target="_blank" rel="noopener noreferrer" class="btn btn-outline"><i class="fa-brands fa-github"></i> View Code</a>`
    : "";

  body.innerHTML = `
    ${modalThumb}
    <h2>${escapeHtml(p.title)}</h2>
    <div class="modal-meta">
      <span><i class="fa-solid fa-tag"></i> ${escapeHtml(p.category)}</span>
      ${p.status ? `<span><i class="fa-solid fa-circle-check"></i> ${escapeHtml(p.status)}</span>` : ""}
      ${p.year ? `<span><i class="fa-solid fa-calendar"></i> ${escapeHtml(String(p.year))}</span>` : ""}
    </div>
    <p style="color:var(--text-muted);">${escapeHtml(p.description || p.shortDescription)}</p>
    ${features ? `<h4 style="margin-top:20px;margin-bottom:10px;">Key Features</h4><ul class="modal-features">${features}</ul>` : ""}
    ${techBadges ? `<h4 style="margin-top:20px;margin-bottom:10px;">Tech Stack</h4><div>${techBadges}</div>` : ""}
    <div class="project-actions" style="margin-top:25px;">${demoBtn}${codeBtn}</div>
  `;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeProjectModal() {
  const modal = document.getElementById("projectModal");
  if (!modal) return;
  modal.classList.remove("active");
  document.body.style.overflow = "";
}

function setupModalClosers() {
  const modal = document.getElementById("projectModal");
  const closeBtn = document.getElementById("modalClose");
  if (closeBtn) closeBtn.addEventListener("click", closeProjectModal);
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeProjectModal();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeProjectModal();
  });
}

// =========================
// CONTACT FORM (FormSubmit AJAX — no backend needed)
// =========================
function setupContactForm() {
  const form = document.getElementById("contactForm");
  const statusEl = document.getElementById("formStatus");
  const submitBtn = document.getElementById("contactSubmitBtn");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    statusEl.className = "form-status";
    statusEl.textContent = "";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData
      });

      if (response.ok) {
        statusEl.textContent = "Thanks! Your message has been sent — I'll get back to you soon.";
        statusEl.className = "form-status success";
        form.reset();
      } else {
        throw new Error("Request failed with status " + response.status);
      }
    } catch (err) {
      statusEl.textContent =
        "Something went wrong sending that. Please email me directly at royelnath123@gmail.com.";
      statusEl.className = "form-status error";
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  });
}

// =========================
// INIT
// =========================
async function loadSiteData() {
  try {
    const res = await fetch("data.json");
    if (!res.ok) throw new Error("Bad response");
    SITE_DATA = await res.json();
  } catch (err) {
    console.warn(
      "Could not load data.json (this is expected if you opened the file directly instead of via a server / GitHub Pages). Using fallback data instead.",
      err
    );
    SITE_DATA = FALLBACK_DATA;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  setupThemeToggle();
  setupNavToggle();
  await loadSiteData();

  renderSkills(SITE_DATA.skills);
  renderServices(SITE_DATA.services);
  renderCertificates(SITE_DATA.certificates);
  renderFilterPills();
  renderProjects();

  setupSearch();
  setupModalClosers();
  setupContactForm();
});
