# Spell Quest 🌻

A fun, dyslexia-friendly app that helps primary school children learn the
**National Curriculum (England)** spellings: the Year 1 and Year 2 common
exception words and the statutory spelling lists for Years 3–4 and 5–6.

Every word a child learns grows into a flower in their spelling garden.

## What it does

- **Spelling families, not random lists.** All 300+ words are grouped
  by pattern (silent letters, soft c, double letters, *-tion* endings and so on),
  each with a child-friendly tip.
- **Look, listen, spell it with me.** Each word is shown and read aloud in a
  British voice, then spelt letter by letter with the letters lighting up
  (Simultaneous Oral Spelling).
- **Syllable chopping.** Every word is shown in coloured syllable chunks
  (*ac·com·mo·date*) with its number of beats. "Chop it" splits the word apart and
  says each syllable in turn.
- **Scaffolding that fades.** A brand-new long word is rebuilt from its syllable
  chunks, then from letter tiles, and once it's growing the child types it.
- **Spaced repetition.** Words come back after 1, 2, 4 and 7 days. A mistake moves
  a word back one step, never to the start.
- **Gentle mistakes.** Feedback shows which letters were right (green) and which
  to look at (orange). There's always a second try.
- **"Show me again"** at any point: peek at the word again with no penalty.
- **Memory tricks** for the trickiest words (*"There's a rat in separate"*), and
  **picture clues** for words that can be drawn.
- **Rainbow writing:** trace the word with a finger in three different colours.

### Games (in every year group)

- 🧺 **Word sorting** – sort words into their spelling-family baskets
- 🔎 **Odd one out** – spot the word with a different pattern
- 🧱 **Word building** – add prefixes and suffixes (*appear → disappear*), then
  spell the whole word, including when letters change (*nature → natural*)
- 🖼️ **Picture words** – spell the word for the picture
- 🥁 **Beat the drum** – tap once for each syllable
- 🌈 **Rainbow writing** – trace words in rainbow colours

### Motivation

- **A garden that grows** 🟫 → 🌱 → 🌿 → 🌷 → 🌻 with every word.
- **Seeds 🌰** earned from practice and games buy new flower types and garden
  decorations (bees, ladybirds, a pond fountain, a rainbow...).
- **Hazel the hedgehog** 🦔 cheers children on, and never scolds.
- **Lots of praise** (around 170 lines in `js/praise.js`): headlines, Hazel's
  comments, streaks ("4 in a row!"), perfect sessions and game cheers. Each list
  is used up before anything repeats, and lines often use the child's name.
- **A weekly mission**, such as "Grow 3 plants in a family" or "Play 2 word games".
- Badges for practice days and "comeback" words.

### For parents and teachers

- **Sibling profiles:** each child has their own garden, progress and settings.
  With more than one child, the app asks who's practising.
- **School weekly list:** type in this week's spelling test words. They're chopped
  into syllables automatically (or type dashes, e.g. *be-cause*) and appear at the
  top of the home screen with all the same help.
- **Smarter mistake tracking:** mistakes are sorted into patterns (double letters,
  silent letters, vowels, letter order, endings, first sounds), with examples.
  Hazel suggests a family to practise when a pattern keeps coming up.
- **Printable practice sheets** for tricky words, words in progress or the school
  list: each word chopped into syllables, a line to trace, space to write it twice,
  and memory tricks.
- **Calm mode** for fewer animations.

## Dyslexia-friendly design

Following the [British Dyslexia Association style guide](https://www.bdadyslexia.org.uk/advice/employers/creating-a-dyslexia-friendly-workplace/dyslexia-friendly-style-guide):

- Off-white background by default, with cream, blue, green, peach, grey and dark tints
- Lexend or Atkinson Hyperlegible fonts, adjustable size and letter spacing
- No italics, no timers, no lives, no clutter
- Audio for every word, with adjustable speed
- A lively, excited voice for praise and a gentle one for encouragement, while
  words are taught slowly and clearly. The most natural-sounding British voice on
  the device is picked automatically, or choose one in Settings
- Happy sound effects (made in code, no audio files), with a soft "hmm" rather
  than a buzzer for mistakes
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
index.html             page shell
css/styles.css         dyslexia-friendly theme, layout and print sheet
js/app.js              router
js/screens.js          home, year groups, families, profiles, settings, grown-ups, school list, print
js/practice.js         look & listen → spell → feedback flow
js/games.js            the six word games
js/garden.js           garden and seed shop
js/rainbow.js          rainbow writing canvas
js/store.js            profiles, progress, spaced repetition, seeds, missions (localStorage)
js/mission.js          weekly missions
js/mistakes.js         sorts mistakes into patterns
js/companion.js        Hazel the hedgehog
js/praise.js           all praise and encouragement lines
js/groups.js           year groups plus the school list
js/words.js            word lists grouped into families, plus memory tricks
js/syllables.js        syllable splits, plus automatic splitting for new words
js/pictures.js         picture clues
js/builder.js          word-building challenges
js/speech.js           British English text-to-speech (teaching, cheerful and gentle styles)
js/sounds.js           celebration sound effects
tools/check-words.mjs  checks every word appears once and has syllables
```

Check the word lists after editing them:

```bash
node tools/check-words.mjs
```

## Ideas for next steps

- [ ] Child records their own memory trick or draws a picture clue
- [ ] Finger-tracing mode on touchscreens
- [ ] More games: Homophone Hunt, Spot the Spelling Monster, a rhyming game
- [ ] Dictation sentences
- [ ] Back up and restore a child's garden with a code
- [ ] Story mode that uses the week's words, read aloud with highlighting
- [ ] OpenDyslexic font option
- [ ] Works offline (installable web app)
- [ ] Test with dyslexic children, parents and SENCos
