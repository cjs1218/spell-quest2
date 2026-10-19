// All the praise in one place.
// Lines are picked from a shuffled "bag", so a child hears every line in a
// list before any repeats. Lines praise effort and strategies as well as
// results, and never scold. {name} becomes the child's name.

import { currentProfile } from "./store.js";

export const PRAISE = {
  // Short headline when a word is spelt right first time.
  correct: [
    "Brilliant!", "Fantastic!", "Superb!", "Spot on!", "Wonderful!", "Amazing!",
    "Nailed it!", "Perfect!", "Smashing!", "Terrific!", "Marvellous!", "Ace!",
    "Stupendous!", "Top marks!", "Spectacular!", "Excellent!", "Bang on!",
    "Fabulous!", "Out of this world!", "Champion spelling!", "Hooray!", "Boom!",
    "Super spelling!", "Way to go, {name}!", "Brilliant, {name}!", "Yes, {name}!",
    "You're a star!", "Word wizard!", "Spelling superstar!", "Magnificent!",
  ],
  // Headline when they get it on the second go.
  retry: [
    "You got it!", "You did it!", "There it is!", "Got it this time!",
    "That's the one!", "You worked it out!", "Never giving up – brilliant!",
    "Second go, success!", "Look at you go!", "Persistence pays off!",
    "Well fixed!", "You cracked it!", "Yes! You figured it out!",
    "That's how we learn!", "Great comeback, {name}!",
  ],
  // Hazel's longer comment when a word is right.
  correctComment: [
    "Wow, look at that grow!",
    "You remembered it!",
    "Super! My prickles are tingling with joy.",
    "Your brain is getting stronger every day.",
    "Those letters were all in the right order. Clever!",
    "I'm doing a happy hedgehog dance!",
    "That word is getting comfy in your memory.",
    "The bees are buzzing about that one!",
    "You looked carefully and it paid off.",
    "Chopping it into beats really helped, didn't it?",
    "Even the worms are clapping. Well, wriggling.",
    "You make it look easy, {name}!",
    "That's going straight into your spelling garden.",
    "I knew you could do it!",
    "Your plant just did a little stretch!",
    "Ooh, I felt the sunshine on that one.",
    "Listening carefully really works, doesn't it?",
    "One more word your brain owns now.",
  ],
  // When a word becomes fully grown.
  mastered: [
    "A new flower for your garden!",
    "That word is fully grown. Hooray!",
    "Full bloom! That word is yours now.",
    "Look at that flower! You've mastered it.",
    "Another flower! Your garden is getting gorgeous.",
    "You've practised that one so well it's blossomed!",
    "Fully grown! The butterflies will love it.",
  ],
  // Three or more right in a row.
  streak: [
    "That's {n} in a row! You're on fire!",
    "{n} in a row! Unstoppable!",
    "Wow, {n} right in a row, {name}!",
    "{n} in a row – the garden's blooming!",
    "Hat-trick and counting! {n} in a row!",
  ],
  // Encouragement after a mistake.
  mistake: [
    "Mistakes help our brains grow, just like plants!",
    "Nearly there! Let's look at it together.",
    "That was a tricky one. Good try!",
    "Even I muddle letters sometimes, and I'm a hedgehog.",
    "Ooh, so close! Lots of the letters were right.",
    "Tricky words take a few goes. You're doing great.",
    "Every try makes it easier next time.",
    "That's a sneaky word! Let's have another look.",
    "Good thinking – let's check the orange letters.",
    "Brave try! Brains grow when things are hard.",
    "No worries, {name}. We'll get it together.",
    "Lots of grown-ups find that word tricky too!",
  ],
  // Hazel at the start of practice.
  start: [
    "Take your time. There's no rush in my garden.",
    "Look, listen, then have a go. You've got this!",
    "Let's water some words together.",
    "Ready, {name}? Let's grow some words!",
    "Remember: chop it, say it, spell it.",
    "I've got my watering can ready!",
    "Let's see which words are ready to grow today.",
  ],
  // Headline at the end of a practice session.
  end: [
    "Great practice!", "What a session!", "Fantastic effort!", "Brilliant work!",
    "You worked so hard!", "Super session, {name}!", "Well done, {name}!",
    "What a gardener!", "Practice complete!", "That was amazing!",
  ],
  // Headline when every word was right first time.
  perfect: [
    "Perfect score!", "Every single one!", "A perfect session!",
    "Full marks, {name}!", "Flawless!", "All right first time!",
  ],
  // Hazel at the end of practice or a game.
  endComment: [
    "What a hard worker! The garden looks lovely.",
    "Come back soon to water your words.",
    "I'm so proud of you for trying.",
    "Your garden is going to look amazing.",
    "Practising a little every day is the secret. You're doing it!",
    "You should be really proud of yourself, {name}.",
    "That was so much fun. Same time tomorrow?",
    "Your brain worked really hard. Time for a stretch!",
    "Every word you practise helps the next one.",
    "I'll look after your plants until next time.",
  ],
  // Greeting on the home screen.
  greet: [
    "Hello {name}! Shall we grow something today?",
    "Hi {name}! The garden's been waiting for you.",
    "Welcome back, {name}! Ready to dig in?",
    "Ooh, {name} is here! Let's get growing.",
    "Morning, noon or night, it's a good time to spell, {name}!",
    "Hello again, {name}! The bees missed you.",
    "{name}! Just in time – the plants are thirsty.",
  ],
  // Short praise in games.
  game: [
    "Yes!", "Correct!", "Well done!", "Spot on!", "Nice one!", "Great!",
    "Brilliant!", "You got it!", "Right!", "Super!", "Excellent!", "Smart thinking!",
    "Nailed it!", "Ace!", "Clever!",
  ],
  // Spotting the odd one out.
  spotted: [
    "Well spotted!", "Sharp eyes!", "Great detective work!", "Eagle eyes!",
    "You found it!", "Super sleuthing!", "Nothing gets past you!",
  ],
  // Game finished.
  gameEnd: [
    "Game complete!", "What a game!", "Game over – and you smashed it!",
    "Brilliant playing!", "Champion player!", "Well played, {name}!", "You're a games star!",
  ],
  // Each rainbow writing star.
  star: [
    "Lovely tracing!", "Beautiful!", "So neat!", "Gorgeous colours!",
    "Careful tracing!", "Wonderful writing!", "Super smooth!", "Lovely letters!",
  ],
  // All three rainbow stars.
  rainbow: [
    "Three stars! Beautiful rainbow writing! 🌈",
    "Three stars! That's a real rainbow! 🌈",
    "All three stars! What a colourful word! 🌈",
    "Three stars! You're a rainbow writer! 🌈",
  ],
};

const bags = {};

/** A praise line of this kind, not repeating until the whole list has been used. */
export function praise(kind, vars = {}) {
  const list = PRAISE[kind] || PRAISE.correct;
  if (!bags[kind]?.length) {
    const fresh = [...list];
    for (let i = fresh.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [fresh[i], fresh[j]] = [fresh[j], fresh[i]];
    }
    // Don't start a new bag with the line that was just used.
    if (fresh.length > 1 && fresh[fresh.length - 1] === bags[`${kind}:last`]) fresh.unshift(fresh.pop());
    bags[kind] = fresh;
  }
  const line = bags[kind].pop();
  bags[`${kind}:last`] = line;
  const name = currentProfile()?.name || "friend";
  return line.replace(/\{name\}/g, name).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
}

/** Text for speaking aloud: drops emoji. */
export const spoken = (text) => text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").trim();
