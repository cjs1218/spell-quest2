// Instructions: "How to play" for children (short, picture-led, read aloud)
// and a guide for grown-ups (setting up, daily use, helping at home, FAQ).

import { currentProfile, markHelpSeen } from "./store.js";
import { say, warm, stop, cheer } from "./speech.js";
import { app, h, esc, on, header } from "./ui.js";

// ---------- children ----------

const KID_STEPS = [
  { icon: "🌱", title: "Tap Today's words", text: "Hazel picks your words." },
  { icon: "👀", title: "Look and listen", text: "Hear the word. Tap ✂️ to chop it and 🔤 to spell it." },
  { icon: "🧠", title: "Use the trick", text: "A trick and a picture help you remember." },
  { icon: "🙈", title: "Hide it, then spell it", text: "Tap I'm ready. Then build the word or type it." },
  { icon: "🤔", title: "Stuck? That's OK!", text: "Tap 👀 to peek. Orange letters show what to fix." },
  { icon: "🌻", title: "Grow your garden", text: "Right answers grow plants. Come back tomorrow to grow more!" },
  { icon: "🌰", title: "Spend your seeds", text: "Buy flowers, bees and more for your garden." },
  { icon: "🎲", title: "Play games", text: "Pick a year to find the games." },
  { icon: "🔊", title: "Tap a speaker", text: "I'll read the words to you." },
];

export function kidsHelpScreen() {
  const me = currentProfile();
  app.innerHTML = h`
    ${header("#/", "How to play")}
    <div class="companion" role="status">
      <span class="hedgehog" aria-hidden="true">🦔</span>
      <p class="bubble speakable"><span class="say-text">Hi ${esc(me?.name || "friend")}! I'm Hazel. Here's how we grow words together.</span><button class="say-btn" type="button" aria-label="Read this out">🔊</button></p>
    </div>
    <button class="btn big" id="read-all">🔊 Read it all to me</button>
    <ol class="kid-steps">
      ${KID_STEPS.map((s, i) => h`
        <li class="kid-step speakable" data-i="${i}">
          <span class="kid-icon" aria-hidden="true">${s.icon}</span>
          <span class="say-text"><strong>${esc(s.title)}</strong> ${esc(s.text)}</span>
          <button class="say-btn" type="button" aria-label="Read this out">🔊</button>
        </li>`).join("")}
    </ol>
    <a class="btn primary big" href="#/" id="go">Let's grow some words! 🌱</a>`;

  markHelpSeen();
  warm(`Hi ${me?.name || "friend"}! I'm Hazel. Here's how we grow words together.`);
  on("#read-all", "click", async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    stop();
    const items = [...app.querySelectorAll(".kid-step")];
    for (const [i, s] of KID_STEPS.entries()) {
      items.forEach((el, n) => el.classList.toggle("reading", n === i));
      items[i].scrollIntoView({ block: "center", behavior: "smooth" });
      await say(`${s.title}. ${s.text}`);
      if (!document.body.contains(btn)) return; // left the page
    }
    items.forEach((el) => el.classList.remove("reading"));
    cheer("Now let's grow some words!");
    btn.disabled = false;
  });
}

// ---------- grown-ups ----------

export function grownUpsGuideScreen() {
  app.innerHTML = h`
    <div class="no-print">${header("#/", "Grown-ups' guide", `<button class="icon-btn" id="print-guide" aria-label="Print this guide">🖨️</button>`)}</div>
    <article class="guide">
      <h1 class="print-only">🌻 Spell Quest: grown-ups' guide</h1>
      <p class="lead">Spell Quest helps children learn the National Curriculum spellings for Years 1 to 6, using methods that work well for dyslexic learners. Here's how to get the most from it.</p>

      <nav class="card guide-contents no-print" aria-label="Contents">
        <strong>Contents</strong>
        <ol>
          <li><a href="#g-setup">Setting up (5 minutes)</a></li>
          <li><a href="#g-daily">A good daily routine</a></li>
          <li><a href="#g-how">How the app teaches</a></li>
          <li><a href="#g-help">How you can help</a></li>
          <li><a href="#g-progress">Understanding progress</a></li>
          <li><a href="#g-school">Using your school's spelling list</a></li>
          <li><a href="#g-safe">Keeping progress safe</a></li>
          <li><a href="#g-faq">Questions and fixes</a></li>
        </ol>
      </nav>

      <section class="card" id="g-setup">
        <h2>1. Setting up (5 minutes)</h2>
        <ol>
          <li><strong>Install it on your tablet or phone.</strong> On iPad or iPhone: open it in Safari, tap <strong>Share ⬆️</strong>, then <strong>Add to Home Screen</strong>. On Android or a computer: use the browser menu and choose <strong>Install app</strong>. From then on, open it from the 🌻 icon. It works without internet, and your child's progress won't be cleared.</li>
          <li><strong>Add your child.</strong> Tap the animal picture at the top of the home screen, then <strong>Add a child</strong>. Choose a name, a picture and their <strong>school year</strong>, which decides which new words they get. Brothers and sisters each get their own garden.</li>
          <li><strong>Choose how it looks and sounds.</strong> Tap ⚙️ for background colour, letters (including <strong>OpenDyslexic</strong>, a font made for dyslexic readers), text size, letter spacing, voice and talking speed. Let your child choose the colour and font they find easiest to read; this varies a lot between children.</li>
          <li><strong>Pick a nice voice.</strong> In ⚙️ Settings, try the voices marked ⭐. On iPad you can download better ones: <em>Settings → Accessibility → Spoken Content → Voices → English (UK)</em>, for example <em>Serena</em> or <em>Kate (Enhanced)</em>.</li>
          <li><strong>Add this week's school spellings</strong> if your child has them (see section 6).</li>
        </ol>
      </section>

      <section class="card" id="g-daily">
        <h2>2. A good daily routine</h2>
        <ul>
          <li><strong>Little and often:</strong> about 10 minutes a day is far better than an hour once a week.</li>
          <li><strong>Start with "Today's words".</strong> The app chooses the words that are due, so you don't need to plan anything. When it says <em>"All watered for today"</em>, that's a good place to stop, or play a game.</li>
          <li><strong>A game to finish</strong> keeps it fun, if your child has energy left.</li>
          <li><strong>Stop while it's still going well.</strong> Ending on a success makes the next session easier to start.</li>
        </ul>
      </section>

      <section class="card" id="g-how">
        <h2>3. How the app teaches</h2>
        <ul>
          <li><strong>Spelling families:</strong> words are grouped by pattern (silent letters, <em>-tion</em>, double letters) rather than random lists, so one rule unlocks many words.</li>
          <li><strong>See it, hear it, say it:</strong> each word is read aloud, chopped into syllables, and spelt letter by letter while the letters light up. This "simultaneous oral spelling" is a well-established method for dyslexic learners.</li>
          <li><strong>Memory tricks and pictures:</strong> well-known tricks such as <em>"There's a rat in separate"</em>, plus "say it the silly way" (<em>Feb-roo-ar-y</em>). Tap any word to see its own page.</li>
          <li><strong>Help that fades:</strong> a new word is first built from syllable chunks, then from letter tiles, then typed from memory.</li>
          <li><strong>Spaced practice:</strong> words come back after 1, 2, 4 and 7 days. A word can only grow one step a day, so a 🌻 flower means your child has remembered it over several days, not just once.</li>
          <li><strong>Kind mistakes:</strong> no timers, no lives, no buzzers. Only the letters that are actually wrong are highlighted, and there's always another try.</li>
        </ul>
      </section>

      <section class="card" id="g-help">
        <h2>4. How you can help</h2>
        <ul>
          <li><strong>Sit with younger children</strong> at first. Older children can practise on their own once they know their way around.</li>
          <li><strong>Praise the effort, not just the score:</strong> <em>"You really listened carefully"</em>, <em>"You didn't give up on that one."</em></li>
          <li><strong>Let mistakes be normal.</strong> If a word goes wrong, say <em>"Let's look at the orange letters together"</em> rather than spelling it for them.</li>
          <li><strong>Make up tricks together.</strong> Tricks children invent themselves are often the ones that stick. Words without a trick show a prompt to make your own.</li>
          <li><strong>Take it off the screen:</strong> print a practice sheet (grown-ups page → Printable practice sheets), write words in the air, or trace them in sand or shaving foam. School tests are handwritten, so writing on paper matters too.</li>
          <li><strong>Talk to school.</strong> Tell your child's teacher or SENCo which words are tricky. The <em>Patterns spotted</em> section on the grown-ups page gives you real examples to share.</li>
        </ul>
      </section>

      <section class="card" id="g-progress">
        <h2>5. Understanding progress</h2>
        <ul>
          <li><strong>🟫 → 🌱 → 🌿 → 🌷 → 🌻</strong> Each word grows with each right answer, on separate days. Four dots under a word show its progress. 🌻 means fully grown.</li>
          <li><strong>💧 Watered</strong> means the word has already grown today and will grow again tomorrow. Practising it again still counts as useful revision.</li>
          <li><strong>A slip moves a word back one step</strong>, never to the start, and it comes back sooner.</li>
          <li><strong>The grown-ups page</strong> (🔒 at the bottom of the home screen) shows progress for each year, words that need practice, and patterns in mistakes, such as double letters or vowel sounds, with a family to practise.</li>
        </ul>
      </section>

      <section class="card" id="g-school">
        <h2>6. Using your school's spelling list</h2>
        <ol>
          <li>Go to the grown-ups page and tap <strong>Add a list</strong>.</li>
          <li>Give it a name, like <em>Week 6 spellings</em>, and type one word per line.</li>
          <li>The app chops each word into syllables for you. If a split looks wrong, type it with dashes, e.g. <strong>be-cause</strong>.</li>
          <li>Tap <strong>Save list</strong>. The words appear at the top of the home screen and in Today's words, with all the same help.</li>
        </ol>
        <p>Change or remove the list each week from the same place.</p>
      </section>

      <section class="card" id="g-safe">
        <h2>7. Keeping progress safe</h2>
        <ul>
          <li>Progress is saved <strong>only on this device</strong>. There are no accounts and nothing is sent anywhere.</li>
          <li><strong>Install it</strong> (see section 1). Safari on iPad and iPhone can clear a website's data after a week without use, but installed apps are safe.</li>
          <li><strong>Make a backup now and then:</strong> grown-ups page → <strong>Save a backup</strong>. Keep the file somewhere safe, such as email or cloud storage. <strong>Restore a backup</strong> brings everything back, including on a new device.</li>
          <li><strong>Moving from Safari to the installed app?</strong> They keep separate progress, so save a backup in Safari first, then restore it inside the installed app.</li>
        </ul>
      </section>

      <section class="card" id="g-faq">
        <h2>8. Questions and fixes</h2>
        <dl class="faq">
          <dt>There's no sound.</dt>
          <dd>Check the device isn't on silent (on iPad, check the side switch or Control Centre) and the volume is up. Then try another voice in ⚙️ Settings. Some browsers only start speaking after the first tap.</dd>
          <dt>The voice sounds robotic.</dt>
          <dd>Choose a voice marked ⭐ in Settings, or download an enhanced voice (see section 1). Microsoft Edge on Windows has very natural voices.</dd>
          <dt>It's too fast, too slow or too excited.</dt>
          <dd>In Settings, change <em>Talking speed</em>, or set <em>Voice style</em> to <em>Calm</em>. You can also turn off <em>Read instructions aloud</em> and the sound effects.</dd>
          <dt>A word won't grow.</dt>
          <dd>Each word grows once a day. If it shows 💧, it has already grown today, so come back tomorrow.</dd>
          <dt>The garden has disappeared.</dt>
          <dd>Check you're opening the app the same way as before (from the Home Screen icon, not a browser tab), and that the right child is chosen. If it's still missing, restore your last backup.</dd>
          <dt>How do I get into the grown-ups page?</dt>
          <dd>Answer the times-table question. It stays open for 10 minutes. It's there to stop accidental changes, not as real security.</dd>
          <dt>Can my child use it on two devices?</dt>
          <dd>Yes. Save a backup on one and restore it on the other. Progress doesn't sync automatically, so pick one main device.</dd>
          <dt>Is it suitable for children who aren't dyslexic?</dt>
          <dd>Yes. Everything that helps dyslexic learners (clear fonts, audio, short sessions, multisensory practice) helps most children.</dd>
        </dl>
      </section>

      <p class="muted small center">Spell Quest has no adverts, no tracking and no accounts. 🦔</p>
      <div class="row no-print"><a class="btn" href="#/help">👧 Show the children's guide</a><a class="btn primary" href="#/">Back to the app</a></div>
    </article>`;
  on("#print-guide", "click", () => window.print());
  // In-page contents links shouldn't change the route.
  app.querySelectorAll('.guide-contents a').forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector(a.getAttribute("href"))?.scrollIntoView({ behavior: "smooth" });
  }));
}
