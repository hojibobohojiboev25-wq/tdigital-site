const defaultContent = {
  siteName: "T.Digital",
  home: {
    title: "Wir entwickeln Websites und Web-Apps fur kleine Unternehmen",
    subtitle: "Ein junges IT-Unternehmen mit Fokus auf Qualitat, Tempo und klare Ergebnisse",
    intro:
      "Wir helfen kleinen Unternehmen, moderne digitale Losungen zu starten. Obwohl wir ein junges Team sind, liefern wir hohe Qualitat, durchdachtes UX und zuverlassige Begleitung in jeder Projektphase.",
    ctaText: "Leistungen ansehen",
    ctaLink: "services.html"
  },
  services: [
    {
      title: "Website-Entwicklung",
      description:
        "Wir erstellen moderne Unternehmenswebsites und Landingpages mit responsivem Design und klarer Struktur fur Ihre Kunden."
    },
    {
      title: "Web-App-Entwicklung",
      description:
        "Wir planen und entwickeln Web-Anwendungen zur Automatisierung von Prozessen, Anfragen, Verwaltung und Kundenkommunikation."
    }
  ],
  about: {
    text:
      "T.Digital ist ein Team, das digitale Losungen fur kleine Unternehmen entwickelt. Wir verbinden Design, Entwicklung und praxisnahe Umsetzung, damit Ihre Prozesse schneller und effizienter laufen.",
    mission:
      "Unser Ziel ist es, die Leistungsfahigkeit kleiner Unternehmen zu verbessern und die technologische Entwicklung im Unternehmertum aktiv zu unterstutzen.",
    founder: {
      name: "Grundername",
      role: "Grunder & Leitung",
      shortBio:
        "Kurzbeschreibung des Grunders und seiner Rolle bei T.Digital. Dieser Text erscheint im Uber-uns-Bereich.",
      fullBio:
        "Ausfuhrlicher Text uber den Grunder: Hintergrund, Erfahrung und Vision fur T.Digital und die Unterstutzung kleiner Unternehmen.",
      photoUrl: "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg",
      linkedin: "",
      email: ""
    }
  },
  contacts: {
    email: "hello@t-digital.de",
    phone: "+49 30 1234 5678",
    address: "Berlin, Deutschland",
    telegram: "@tdigital_team",
    workingHours: "Mo-Fr, 09:00-18:00"
  },
  projects: [
    {
      name: "Meine Projekte",
      description:
        "Hier werden Ihre realisierten Projekte veroffentlicht: Websites und Web-Anwendungen fur kleine Unternehmen.",
      link: "#"
    }
  ]
};

function normalizeContent(parsed) {
  const parsedAbout = (parsed && parsed.about) || {};
  const parsedFounder = parsedAbout.founder || {};
  return {
    ...structuredClone(defaultContent),
    ...(parsed || {}),
    home: { ...defaultContent.home, ...((parsed && parsed.home) || {}) },
    about: {
      ...defaultContent.about,
      ...parsedAbout,
      founder: {
        ...defaultContent.about.founder,
        ...parsedFounder
      }
    },
    contacts: { ...defaultContent.contacts, ...((parsed && parsed.contacts) || {}) },
    services: Array.isArray(parsed && parsed.services) ? parsed.services : defaultContent.services,
    projects: Array.isArray(parsed && parsed.projects) ? parsed.projects : defaultContent.projects
  };
}

async function getContent() {
  try {
    const response = await fetch("/api/content", {
      headers: { Accept: "application/json" }
    });
    if (!response.ok) {
      return structuredClone(defaultContent);
    }
    const payload = await response.json();
    return normalizeContent(payload.content);
  } catch {
    return structuredClone(defaultContent);
  }
}

async function saveContent(nextContent, token) {
  const response = await fetch("/api/admin/content", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      content: normalizeContent(nextContent)
    })
  });

  if (!response.ok) {
    let message = "Speichern fehlgeschlagen.";
    try {
      const errorPayload = await response.json();
      if (errorPayload && errorPayload.error) {
        message = errorPayload.error;
      }
    } catch {
      // Use fallback message.
    }
    throw new Error(message);
  }

  return response.json();
}

window.TDigitalContent = {
  defaultContent,
  normalizeContent,
  getContent,
  saveContent
};
