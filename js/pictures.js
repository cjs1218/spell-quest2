// Picture clues for words that can be drawn. Used in the learn step and the
// Picture Words game. Only concrete, unambiguous pictures are included.

export const PICTURES = {
  // Year 1
  school: "🏫", house: "🏠", friend: "🤝", love: "❤️", one: "1️⃣", eye: "👁️",
  // Year 2
  door: "🚪", child: "🧒", children: "👧👦", climb: "🧗", gold: "🥇", cold: "🥶",
  steak: "🥩", father: "👨", grass: "🌱", plant: "🪴", bath: "🛁", path: "🛤️",
  hour: "⏰", sugar: "🍬", clothes: "👕", people: "👥", water: "💧", money: "💰",
  Christmas: "🎄", beautiful: "🌸", half: "🌓", wild: "🦁", break: "💔",
  // Years 3 & 4
  bicycle: "🚲", island: "🏝️", calendar: "📅", circle: "⭕", earth: "🌍",
  eight: "8️⃣", fruit: "🍎", guard: "💂", heart: "❤️", library: "📚",
  medicine: "💊", minute: "⏱️", potatoes: "🥔", question: "❓", weight: "⚖️",
  woman: "👩", women: "👩👩", height: "📏", knowledge: "🧠", answer: "💬",
  history: "🏛️", build: "🏗️", group: "👨‍👩‍👧‍👦", quarter: "🕒", surprise: "🎁",
  experiment: "🧪", exercise: "🏃", strength: "💪", reign: "👑", century: "💯",
  // Years 5 & 6
  yacht: "⛵", muscle: "💪", lightning: "⚡", queue: "🧍🧍🧍", restaurant: "🍽️",
  soldier: "💂", temperature: "🌡️", vegetable: "🥦", vehicle: "🚗",
  dictionary: "📖", shoulder: "🤷", stomach: "🫃", forty: "4️⃣0️⃣", bruise: "🩹",
  signature: "✍️", ancient: "🏺", parliament: "🏛️", programme: "📺",
  rhythm: "🥁", symbol: "♻️", government: "🏛️", equipment: "🧰", twelfth: "1️⃣2️⃣",
  environment: "🌳", communicate: "💬", competition: "🏆", amateur: "🎨",
  neighbour: "🏘️", bargain: "🏷️", embarrass: "😳", conscious: "😮", curiosity: "🔍",
};

export const picture = (word) => PICTURES[word] || null;
