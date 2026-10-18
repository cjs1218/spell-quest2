# Spell Quest 🌻

A fun, dyslexia-friendly app that helps primary school children learn the
**National Curriculum (England) statutory spelling lists** for Years 3–4 and 5–6.

Every word a child learns grows into a flower in their spelling garden.

## What it does

- **Spelling families, not random lists.** All 200 statutory words are grouped
  by pattern (silent letters, soft c, double letters, *-tion* endings and so on),
  each with a child-friendly tip.
- **Look, listen, spell it with me.** Each word is shown and read aloud in a
  British voice, then spelt letter by letter with the letters lighting up
  (Simultaneous Oral Spelling).
- **Scaffolding that fades.** New words are built from letter tiles. Once a word
  is growing, the child types it.
- **Spaced repetition.** Words come back after 1, 2, 4 and 7 days. A mistake moves
  a word back one step, never to the start.
- **Gentle mistakes.** Feedback shows which letters were right (green) and which
  to look at (orange). There's always a second try.
- **Memory tricks** for the trickiest words (*"There's a rat in separate"*).
- **A garden that grows** 🟫 → 🌱 → 🌿 → 🌷 → 🌻, plus badges for practice days and
  "comeback" words.
- **Grown-ups page** showing progress and the words that need more practice.

## Dyslexia-friendly design

Following the [British Dyslexia Association style guide](https://www.bdadyslexia.org.uk/advice/employers/creating-a-dyslexia-friendly-workplace/dyslexia-friendly-style-guide):

- Off-white background by default, with cream, blue, green, peach, grey and dark tints
- Lexend or Atkinson Hyperlegible fonts, adjustable size and letter spacing
- No italics, no timers, no lives, no clutter
- Audio for every word, with adjustable speed
- Large tap targets, works on tablets and phones, respects reduced-motion settings

## Privacy

There are no accounts, ads or analytics. Progress is saved only in the browser on
the device being used. This keeps it in line with the ICO's
[Age Appropriate Design Code](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/).

## Running it

It's plain HTML, CSS and JavaScript with no build step or dependencies.

```bash
# from the project folder
python3 -m http.server 8000
# then open http://localhost:8000
```

(Opening `index.html` directly won't work because browsers block JavaScript
modules on `file://` pages.)

### Publish free with GitHub Pages

1. On GitHub, go to **Settings → Pages**.
2. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. After a minute the app is live at `https://<your-username>.github.io/spell-quest2/`.

## Project structure

```
index.html            page shell
css/styles.css        dyslexia-friendly theme and layout
js/words.js           statutory word lists grouped into families, plus memory tricks
js/store.js           progress, spaced repetition and settings (localStorage)
js/speech.js          British English text-to-speech
js/app.js             screens and practice flow
tools/check-words.mjs checks every statutory word appears exactly once
```

Check the word lists after editing them:

```bash
node tools/check-words.mjs
```

## Ideas for next steps

- [ ] Syllable-chopping view (*dis·ap·pear*) for longer words
- [ ] Child records their own memory trick or draws a picture clue
- [ ] Finger-tracing mode on touchscreens
- [ ] Mini-games: Syllable Smash, Homophone Hunt, Spot the Spelling Monster
- [ ] Story mode that uses the week's words, read aloud with highlighting
- [ ] Year 1–2 common exception words
- [ ] Import a school's weekly list
- [ ] OpenDyslexic font option
- [ ] Works offline (installable web app)
- [ ] Test with dyslexic children, parents and SENCos
