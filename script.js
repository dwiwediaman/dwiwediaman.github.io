// Year stamp
document.getElementById("year").textContent = new Date().getFullYear();

// Theme toggle (persists in localStorage). Defaults to dark.
const themeToggle = document.getElementById("themeToggle");
const root = document.documentElement;
const STORAGE_KEY = "rd-portfolio-theme";

const saved = localStorage.getItem(STORAGE_KEY);
if (saved === "light") root.setAttribute("data-theme", "light");

themeToggle.addEventListener("click", () => {
  const isLight = root.getAttribute("data-theme") === "light";
  if (isLight) {
    root.removeAttribute("data-theme");
    localStorage.setItem(STORAGE_KEY, "dark");
  } else {
    root.setAttribute("data-theme", "light");
    localStorage.setItem(STORAGE_KEY, "light");
  }
});
