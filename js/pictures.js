// Picture clues for words that can be drawn.
//
// PICTURES are gentle hints shown while learning a word, so a loose link is
// fine (🎁 for "surprise"). Each picture is used for only one word, and
// pictures that could mislead have been left out.
//
// GAME_WORDS are the only words used in the Picture Words game, where the child
// has to work out the word from the picture alone, so they must be unmistakable.

export const PICTURES = {
  // Year 1
  school: "🏫", house: "🏠", friend: "🤝", one: "1️⃣",
  // Year 2
  door: "🚪", child: "🧒", children: "👧👦", climb: "🧗", cold: "🥶", steak: "🥩",
  grass: "🌱", plant: "🪴", bath: "🛁", eye: "👁️", sugar: "🍬", clothes: "👕",
  water: "💧", money: "💰", Christmas: "🎄", beautiful: "🌸", wild: "🦁",
  // Years 3 & 4
  bicycle: "🚲", island: "🏝️", calendar: "📅", circle: "⭕", earth: "🌍",
  eight: "8️⃣", fruit: "🍎", guard: "💂", heart: "❤️", library: "📚",
  medicine: "💊", minute: "⏱️", potatoes: "🥔", question: "❓", weight: "⚖️",
  woman: "👩", women: "👩‍🦰👩", height: "📏", build: "🏗️", surprise: "🎁",
  experiment: "🧪", exercise: "🏃", reign: "👑",
  // Years 5 & 6
  yacht: "⛵", muscle: "💪", lightning: "⚡", queue: "🧍🧍🧍", restaurant: "🍽️",
  temperature: "🌡️", vegetable: "🥦", vehicle: "🚗", dictionary: "📖",
  forty: "4️⃣0️⃣", bruise: "🩹", signature: "✍️", ancient: "🏺", programme: "📺",
  rhythm: "🥁", equipment: "🧰", competition: "🏆", embarrass: "😳",
};

// Unmistakable pictures only, for the Picture Words game.
export const GAME_WORDS = new Set([
  "school", "house", "one",
  "door", "climb", "bath", "eye", "water", "money", "child",
  "bicycle", "island", "calendar", "circle", "earth", "eight", "heart", "potatoes",
  "question", "woman", "guard", "medicine",
  "yacht", "muscle", "lightning", "queue", "temperature", "forty",
]);

export const picture = (word) => PICTURES[word] || null;
export const gamePicture = (word) => (GAME_WORDS.has(word) ? PICTURES[word] : null);
