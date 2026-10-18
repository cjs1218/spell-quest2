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

function route() {
  const [, screen, a, b] = (location.hash || "#/").split("/");

  // With more than one child on the device, ask who's practising first.
  const picked = (() => { try { return sessionStorage.getItem("spellquest.picked"); } catch { return "1"; } })();
  if (profiles().length > 1 && !picked && screen !== "profiles" && screen !== "grown-ups") {
    location.hash = "#/profiles";
    return;
  }

  if (screen === "year") yearScreen(a);
  else if (screen === "family") familyScreen(a);
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

applySettings();
schoolGroup();
window.addEventListener("hashchange", () => { stop(); route(); });
route();
