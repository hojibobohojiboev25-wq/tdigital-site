function markActiveAdminNav() {
  const current = location.pathname.split("/").pop() || "admin.html";
  document.querySelectorAll("[data-admin-nav]").forEach((link) => {
    if (link.getAttribute("href") === current) {
      link.classList.add("active");
    }
  });
}

function setSiteNameLabel(content) {
  document.querySelectorAll("[data-site-name]").forEach((el) => {
    el.textContent = content.siteName;
  });
}

function createInput(labelText, value, type = "text") {
  const label = document.createElement("label");
  label.textContent = labelText;
  const input = document.createElement(type === "textarea" ? "textarea" : "input");
  if (type !== "textarea") input.type = type;
  input.value = value || "";
  label.appendChild(input);
  return { label, input };
}

function showSaved(statusNode) {
  statusNode.textContent = "Anderungen wurden gespeichert.";
  statusNode.hidden = false;
}

function initHomePage(state, saveContent) {
  const form = document.getElementById("homeForm");
  const status = document.getElementById("status");
  const siteName = document.getElementById("siteName");
  const homeTitle = document.getElementById("homeTitle");
  const homeSubtitle = document.getElementById("homeSubtitle");
  const homeIntro = document.getElementById("homeIntro");
  const homeCtaText = document.getElementById("homeCtaText");
  const homeCtaLink = document.getElementById("homeCtaLink");

  siteName.value = state.siteName;
  homeTitle.value = state.home.title;
  homeSubtitle.value = state.home.subtitle;
  homeIntro.value = state.home.intro;
  homeCtaText.value = state.home.ctaText;
  homeCtaLink.value = state.home.ctaLink;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const next = {
      ...state,
      siteName: siteName.value.trim() || state.siteName,
      home: {
        title: homeTitle.value.trim(),
        subtitle: homeSubtitle.value.trim(),
        intro: homeIntro.value.trim(),
        ctaText: homeCtaText.value.trim(),
        ctaLink: homeCtaLink.value.trim() || "services.html"
      }
    };
    try {
      await saveContent(next);
    } catch (error) {
      status.textContent = error.message || "Speichern fehlgeschlagen.";
      status.hidden = false;
      return;
    }
    showSaved(status);
  });
}

function initAboutPage(state, saveContent) {
  const form = document.getElementById("aboutForm");
  const status = document.getElementById("status");
  const aboutText = document.getElementById("aboutText");
  const aboutMission = document.getElementById("aboutMission");

  aboutText.value = state.about.text;
  aboutMission.value = state.about.mission;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const next = {
      ...state,
      about: {
        text: aboutText.value.trim(),
        mission: aboutMission.value.trim()
      }
    };
    try {
      await saveContent(next);
    } catch (error) {
      status.textContent = error.message || "Speichern fehlgeschlagen.";
      status.hidden = false;
      return;
    }
    showSaved(status);
  });
}

function initContactsPage(state, saveContent) {
  const form = document.getElementById("contactsForm");
  const status = document.getElementById("status");
  const email = document.getElementById("contactEmail");
  const phone = document.getElementById("contactPhone");
  const address = document.getElementById("contactAddress");
  const telegram = document.getElementById("contactTelegram");
  const workingHours = document.getElementById("contactHours");

  email.value = state.contacts.email;
  phone.value = state.contacts.phone;
  address.value = state.contacts.address;
  telegram.value = state.contacts.telegram;
  workingHours.value = state.contacts.workingHours;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const next = {
      ...state,
      contacts: {
        email: email.value.trim(),
        phone: phone.value.trim(),
        address: address.value.trim(),
        telegram: telegram.value.trim(),
        workingHours: workingHours.value.trim()
      }
    };
    try {
      await saveContent(next);
    } catch (error) {
      status.textContent = error.message || "Speichern fehlgeschlagen.";
      status.hidden = false;
      return;
    }
    showSaved(status);
  });
}

function renderServiceRows(container, services) {
  container.innerHTML = "";
  services.forEach((service, index) => {
    const wrap = document.createElement("div");
    wrap.className = "item-card";
    const title = createInput("Leistungsname", service.title);
    const description = createInput("Leistungsbeschreibung", service.description, "textarea");
    wrap.append(title.label, description.label);

    const actions = document.createElement("div");
    actions.className = "row-actions";
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "button ghost";
    remove.textContent = "Loschen";
    remove.addEventListener("click", () => {
      services.splice(index, 1);
      renderServiceRows(container, services);
    });
    actions.appendChild(remove);
    wrap.appendChild(actions);
    wrap._titleInput = title.input;
    wrap._descriptionInput = description.input;
    container.appendChild(wrap);
  });
}

function initServicesPage(state, saveContent) {
  const form = document.getElementById("servicesForm");
  const status = document.getElementById("status");
  const rows = document.getElementById("servicesRows");
  const add = document.getElementById("addService");
  const services = state.services.map((item) => ({ ...item }));

  renderServiceRows(rows, services);

  add.addEventListener("click", () => {
    services.push({ title: "Neue Leistung", description: "Leistungsbeschreibung" });
    renderServiceRows(rows, services);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const nextServices = Array.from(rows.children)
      .map((row) => ({
        title: row._titleInput.value.trim(),
        description: row._descriptionInput.value.trim()
      }))
      .filter((item) => item.title);

    const next = {
      ...state,
      services: nextServices
    };
    try {
      await saveContent(next);
    } catch (error) {
      status.textContent = error.message || "Speichern fehlgeschlagen.";
      status.hidden = false;
      return;
    }
    showSaved(status);
  });
}

function renderProjectRows(container, projects) {
  container.innerHTML = "";
  projects.forEach((project, index) => {
    const wrap = document.createElement("div");
    wrap.className = "item-card";
    const name = createInput("Projektname", project.name);
    const description = createInput("Projektbeschreibung", project.description, "textarea");
    const link = createInput("Link", project.link);
    wrap.append(name.label, description.label, link.label);

    const actions = document.createElement("div");
    actions.className = "row-actions";
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "button ghost";
    remove.textContent = "Loschen";
    remove.addEventListener("click", () => {
      projects.splice(index, 1);
      renderProjectRows(container, projects);
    });
    actions.appendChild(remove);
    wrap.appendChild(actions);
    wrap._nameInput = name.input;
    wrap._descriptionInput = description.input;
    wrap._linkInput = link.input;
    container.appendChild(wrap);
  });
}

function initProjectsPage(state, saveContent) {
  const form = document.getElementById("projectsForm");
  const status = document.getElementById("status");
  const rows = document.getElementById("projectsRows");
  const add = document.getElementById("addProject");
  const projects = state.projects.map((item) => ({ ...item }));

  renderProjectRows(rows, projects);

  add.addEventListener("click", () => {
    projects.push({ name: "Neues Projekt", description: "Projektbeschreibung", link: "#" });
    renderProjectRows(rows, projects);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const nextProjects = Array.from(rows.children)
      .map((row) => ({
        name: row._nameInput.value.trim(),
        description: row._descriptionInput.value.trim(),
        link: row._linkInput.value.trim()
      }))
      .filter((item) => item.name);

    const next = {
      ...state,
      projects: nextProjects
    };
    try {
      await saveContent(next);
    } catch (error) {
      status.textContent = error.message || "Speichern fehlgeschlagen.";
      status.hidden = false;
      return;
    }
    showSaved(status);
  });
}

function initDashboard(defaultContent, saveContent) {
  const reset = document.getElementById("resetDefault");
  if (reset) {
    reset.addEventListener("click", async () => {
      if (!confirm("Mochten Sie alle Inhalte auf Standardwerte zurucksetzen?")) return;
      try {
        await saveContent(defaultContent);
        alert("Inhalte wurden zuruckgesetzt.");
      } catch {
        alert("Zurucksetzen fehlgeschlagen.");
      }
    });
  }

  const credentialsForm = document.getElementById("credentialsForm");
  if (!credentialsForm) return;

  const newAdminLogin = document.getElementById("newAdminLogin");
  const currentAdminPassword = document.getElementById("currentAdminPassword");
  const newAdminPassword = document.getElementById("newAdminPassword");
  const confirmAdminPassword = document.getElementById("confirmAdminPassword");
  const credentialsStatus = document.getElementById("credentialsStatus");
  const { getAdminUsername, updateAdminCredentials } = window.TDigitalAdminAuth;

  getAdminUsername().then((username) => {
    newAdminLogin.value = username || "";
  });

  credentialsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const username = newAdminLogin.value.trim();
    const currentPassword = currentAdminPassword.value;
    const password = newAdminPassword.value;
    const confirmPassword = confirmAdminPassword.value;

    if (!username) {
      credentialsStatus.textContent = "Login darf nicht leer sein.";
      credentialsStatus.hidden = false;
      return;
    }

    if (password.length < 6) {
      credentialsStatus.textContent = "Passwort muss mindestens 6 Zeichen haben.";
      credentialsStatus.hidden = false;
      return;
    }

    if (password !== confirmPassword) {
      credentialsStatus.textContent = "Passworter stimmen nicht uberein.";
      credentialsStatus.hidden = false;
      return;
    }

    try {
      await updateAdminCredentials(currentPassword, username, password);
    } catch (error) {
      credentialsStatus.textContent = error.message || "Daten konnten nicht gespeichert werden.";
      credentialsStatus.hidden = false;
      return;
    }

    currentAdminPassword.value = "";
    newAdminPassword.value = "";
    confirmAdminPassword.value = "";
    credentialsStatus.textContent = "Neue Zugangsdaten wurden gespeichert.";
    credentialsStatus.hidden = false;
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const { getContent, saveContent, defaultContent } = window.TDigitalContent;
  const { adminLogout, getToken } = window.TDigitalAdminAuth;
  const state = await getContent();
  const token = getToken();
  const saveContentWithAuth = (content) => saveContent(content, token);
  const page = document.body.dataset.adminPage;

  markActiveAdminNav();
  setSiteNameLabel(state);
  document.querySelectorAll("[data-admin-logout]").forEach((button) => {
    button.addEventListener("click", adminLogout);
  });

  if (page === "home") initHomePage(state, saveContentWithAuth);
  if (page === "services") initServicesPage(state, saveContentWithAuth);
  if (page === "about") initAboutPage(state, saveContentWithAuth);
  if (page === "contacts") initContactsPage(state, saveContentWithAuth);
  if (page === "projects") initProjectsPage(state, saveContentWithAuth);
  if (page === "dashboard") initDashboard(defaultContent, saveContentWithAuth);
});
