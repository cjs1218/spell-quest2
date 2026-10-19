// Keeping progress safe: installing to the home screen, asking the browser to
// keep our data, and saving / restoring a backup file.
//
// Why: Safari on iPad and iPhone can delete a website's saved data if it
// hasn't been opened for about a week. Apps added to the Home Screen are not
// affected, and a backup file can always bring a garden back.

import { exportBackup, importBackup, markBackedUp, lastBackup, requestPersistence } from "./store.js";
import { h, on, toast } from "./ui.js";

export const isStandalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;

export const isAppleTouch = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

// Chrome / Edge / Android offer their own install prompt.
let installPrompt = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  installPrompt = e;
});

let persisted = null;
export async function protectStorage() {
  persisted = await requestPersistence();
  return persisted;
}

const daysSince = (iso) => (iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86400000) : null);

/** Whether to show the "keep the garden safe" reminder on the home screen. */
export function needsSafetyReminder() {
  try { if (localStorage.getItem("spellquest.safetyDismissed")) return false; } catch { /* ignore */ }
  return isAppleTouch() && !isStandalone();
}
export function dismissSafetyReminder() {
  try { localStorage.setItem("spellquest.safetyDismissed", "1"); } catch { /* ignore */ }
}

export function keepSafeHtml() {
  const since = daysSince(lastBackup());
  const installed = isStandalone();
  let installHelp;
  if (installed) {
    installHelp = `<p>✅ Spell Quest is installed as an app on this device.</p>`;
  } else if (isAppleTouch()) {
    installHelp = h`
      <p><strong>Add it to the Home Screen</strong> so Safari doesn't clear the garden after a week away:</p>
      <ol class="small">
        <li>Tap the <strong>Share</strong> button <span aria-hidden="true">⬆️</span> at the top or bottom of Safari.</li>
        <li>Choose <strong>Add to Home Screen</strong>.</li>
        <li>Open Spell Quest from the new 🌻 icon from now on.</li>
      </ol>
      <p class="muted small">Progress saved in Safari stays in Safari, so make a backup below first and restore it inside the new app.</p>`;
  } else {
    installHelp = h`
      <p><strong>Install it as an app</strong> so it opens like any other app and works without internet.</p>
      <button class="btn" id="install" ${installPrompt ? "" : "hidden"}>📲 Install Spell Quest</button>
      <p class="muted small" ${installPrompt ? "hidden" : ""}>Use your browser's menu and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</p>`;
  }
  return h`
    <section class="card" id="keep-safe">
      <h2>🛡️ Keep the garden safe</h2>
      ${installHelp}
      <p class="small">${persisted ? "✅ This browser has agreed to keep Spell Quest's data." : "Progress is saved on this device only."}</p>
      <h3>Backup</h3>
      <p class="small">${since === null ? "No backup made yet." : since === 0 ? "Last backup: today." : `Last backup: ${since} day${since === 1 ? "" : "s"} ago.`}
        A backup file holds every child's garden and progress. Keep it somewhere safe, or use it to move to a new device.</p>
      <div class="row left">
        <button class="btn primary" id="backup">💾 Save a backup</button>
        <label class="btn" for="restore-file">📂 Restore a backup</label>
        <input id="restore-file" type="file" accept=".json,application/json" hidden />
      </div>
    </section>`;
}

export function setupKeepSafe(root, onRestored) {
  on("#install", "click", async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice.catch(() => null);
    installPrompt = null;
  }, root);

  on("#backup", "click", () => {
    const data = JSON.stringify(exportBackup());
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `spell-quest-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    markBackedUp();
    toast("Backup saved 💾");
    onRestored?.(false);
  }, root);

  root.querySelector("#restore-file")?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const backup = JSON.parse(await file.text());
      const names = backup?.root?.profiles?.map((p) => p.name).join(", ") || "";
      if (!confirm(`Restore this backup${names ? ` (${names})` : ""}? It replaces what's on this device now.`)) return;
      importBackup(backup);
      toast("Backup restored 🌻");
      onRestored?.(true);
    } catch (err) {
      alert(err.message || "That file couldn't be read.");
    }
  });
}
