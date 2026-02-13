document.addEventListener("DOMContentLoaded", async () => {
  const { isAdminAuthenticated, adminLogin } = window.TDigitalAdminAuth;

  if (await isAdminAuthenticated()) {
    location.replace("admin.html");
    return;
  }

  const form = document.getElementById("adminLoginForm");
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const error = document.getElementById("loginError");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    error.textContent = "";
    let ok = false;
    try {
      ok = await adminLogin(username.value.trim(), password.value);
    } catch {
      error.textContent = "Serverfehler. Bitte erneut versuchen.";
      return;
    }
    if (!ok) {
      error.textContent = "Falscher Login oder falsches Passwort.";
      return;
    }
    const params = new URLSearchParams(location.search);
    const next = params.get("next") || "admin.html";
    location.replace(next);
  });
});
