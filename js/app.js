// Spell Quest: router. Screens live in screens.js, practice.js, games.js and garden.js.

import { profiles } from "./store.js";
import { stop } from "./speech.js";
import { schoolGroup } from "./groups.js";
import { applySettings } from "./ui.js";
import {
  homeScreen, yearScreen, familyScreen, profilesScreen, settingsScreen,
  grownUpsScreen, schoolScreen, printScreen,
} from "./screens.js";
import { gardenScreen } from "./garden.js";
import { gameScreen } from "./games.js";
import { todayScreen, wordScreen } from "./screens.js";
import { isUnlocked, gateScreen } from "./gate.js";
import { protectStorage } from "./backup.js";
import "./readaloud.js";

const GROWN_UP_SCREENS = new Set(["grown-ups", "school", "print"]);

function route() {
  const [, screen, a, b] = (location.hash || "#/").split("/");

  // With more than one child on the device, ask who's practising first.
  const picked = (() => { try { return sessionStorage.getItem("spellquest.picked"); } catch { return "1"; } })();
  if (profiles().length > 1 && !picked && screen !== "profiles" && !GROWN_UP_SCREENS.has(screen)) {
    location.hash = "#/profiles";
    return;
  }

  // Grown-up pages ask a quick question first (stays unlocked for 10 minutes).
  if (GROWN_UP_SCREENS.has(screen) && !isUnlocked()) {
    gateScreen(route);
    window.scrollTo(0, 0);
    return;
  }

  if (screen === "today") todayScreen();
  else if (screen === "year") yearScreen(a);
  else if (screen === "family") familyScreen(a);
  else if (screen === "word") wordScreen(a, b);
  else if (screen === "game") gameScreen(a, b);
  else if (screen === "garden") gardenScreen();
  else if (screen === "profiles") profilesScreen();
  else if (screen === "settings") settingsScreen();
  else if (screen === "grown-ups") grownUpsScreen();
  else if (screen === "school") schoolScreen();
  else if (screen === "print") printScreen(a);
  else homeScreen();
  window.scrollTo(0, 0);
}

// Tapping a link to the page you're already on (e.g. ✖️ during practice, which
// happens "inside" the family page) wouldn't change the address, so re-route.
document.addEventListener("click", (e) => {
  const a = e.target.closest?.('a[href^="#"]');
  if (a && a.getAttribute("href") === (location.hash || "#/")) {
    e.preventDefault();
    stop();
    route();
  }
});

applySettings();
schoolGroup();
protectStorage();

// Offline support and "install as an app" (needs https or localhost).
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
window.addEventListener("hashchange", () => { stop(); route(); });
route();
