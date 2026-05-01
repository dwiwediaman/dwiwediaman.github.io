// Year stamp
document.getElementById("year").textContent = new Date().getFullYear();

// Theme toggle (persists in localStorage). Initial theme is applied
// pre-paint via the inline <head> script to prevent FOUC.
const themeToggle = document.getElementById("themeToggle");
const root = document.documentElement;
const STORAGE_KEY = "rd-portfolio-theme";

function syncToggleState() {
  const isLight = root.dataset.theme === "light";
  themeToggle.setAttribute("aria-pressed", String(isLight));
}
syncToggleState();

themeToggle.addEventListener("click", () => {
  const isLight = root.dataset.theme === "light";
  if (isLight) {
    delete root.dataset.theme;
    localStorage.setItem(STORAGE_KEY, "dark");
  } else {
    root.dataset.theme = "light";
    localStorage.setItem(STORAGE_KEY, "light");
  }
  syncToggleState();
});
