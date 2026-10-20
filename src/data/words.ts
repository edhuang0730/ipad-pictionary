import { WordCategory, WordDifficulty, WordEntry } from '../types/game';

export const WORD_CATEGORIES: WordCategory[] = [
  'All',
  'Animals & Nature',
  'Food & Objects',
  'Actions & Phrases',
  'Pop Culture & Movies',
  'Everyday Life',
];

export const WORD_DIFFICULTIES: WordDifficulty[] = [
  'All',
  'Easy',
  'Medium',
  'Hard',
];

export const WORD_BANK: WordEntry[] = [
  // ==========================================================================
  // ANIMALS & NATURE
  // ==========================================================================
  { word: 'Cat', category: 'Animals & Nature', difficulty: 'Easy' },
  { word: 'Butterfly', category: 'Animals & Nature', difficulty: 'Easy' },
  { word: 'Jellyfish', category: 'Animals & Nature', difficulty: 'Easy' },
  { word: 'Giraffe', category: 'Animals & Nature', difficulty: 'Easy' },
  { word: 'Volcano', category: 'Animals & Nature', difficulty: 'Easy' },
  { word: 'Rainbow', category: 'Animals & Nature', difficulty: 'Easy' },
  { word: 'Penguin', category: 'Animals & Nature', difficulty: 'Easy' },
  { word: 'Octopus', category: 'Animals & Nature', difficulty: 'Easy' },
  { word: 'Cactus', category: 'Animals & Nature', difficulty: 'Easy' },
  { word: 'Tornado', category: 'Animals & Nature', difficulty: 'Easy' },
  { word: 'Shark', category: 'Animals & Nature', difficulty: 'Easy' },
  { word: 'Spider Web', category: 'Animals & Nature', difficulty: 'Easy' },
  { word: 'Palm Tree', category: 'Animals & Nature', difficulty: 'Easy' },
  { word: 'Bumblebee', category: 'Animals & Nature', difficulty: 'Easy' },
  { word: 'Flamingo', category: 'Animals & Nature', difficulty: 'Medium' },
  { word: 'Porcupine', category: 'Animals & Nature', difficulty: 'Medium' },
  { word: 'Kangaroo', category: 'Animals & Nature', difficulty: 'Medium' },
  { word: 'Chameleon', category: 'Animals & Nature', difficulty: 'Medium' },
  { word: 'Venus Flytrap', category: 'Animals & Nature', difficulty: 'Medium' },
  { word: 'Peacock', category: 'Animals & Nature', difficulty: 'Medium' },
  { word: 'Seahorse', category: 'Animals & Nature', difficulty: 'Medium' },
  { word: 'Beaver Dam', category: 'Animals & Nature', difficulty: 'Medium' },
  { word: 'Shooting Star', category: 'Animals & Nature', difficulty: 'Medium' },
  { word: 'Hammerhead Shark', category: 'Animals & Nature', difficulty: 'Medium' },
  { word: 'Avalanche', category: 'Animals & Nature', difficulty: 'Medium' },
  { word: 'Pufferfish', category: 'Animals & Nature', difficulty: 'Medium' },
  { word: 'Platypus', category: 'Animals & Nature', difficulty: 'Hard' },
  { word: 'Northern Lights', category: 'Animals & Nature', difficulty: 'Hard' },
  { word: 'Hibernation', category: 'Animals & Nature', difficulty: 'Hard' },
  { word: 'Photosynthesis', category: 'Animals & Nature', difficulty: 'Hard' },
  { word: 'Praying Mantis', category: 'Animals & Nature', difficulty: 'Hard' },
  { word: 'Coral Reef', category: 'Animals & Nature', difficulty: 'Hard' },
  { word: 'Metamorphosis', category: 'Animals & Nature', difficulty: 'Hard' },
  { word: 'Solar Eclipse', category: 'Animals & Nature', difficulty: 'Hard' },

  // ==========================================================================
  // FOOD & OBJECTS
  // ==========================================================================
  { word: 'Pizza Slice', category: 'Food & Objects', difficulty: 'Easy' },
  { word: 'Ice Cream Cone', category: 'Food & Objects', difficulty: 'Easy' },
  { word: 'Hamburger', category: 'Food & Objects', difficulty: 'Easy' },
  { word: 'Sunglasses', category: 'Food & Objects', difficulty: 'Easy' },
  { word: 'Umbrella', category: 'Food & Objects', difficulty: 'Easy' },
  { word: 'Lightbulb', category: 'Food & Objects', difficulty: 'Easy' },
  { word: 'Scissors', category: 'Food & Objects', difficulty: 'Easy' },
  { word: 'Cupcake', category: 'Food & Objects', difficulty: 'Easy' },
  { word: 'Headphones', category: 'Food & Objects', difficulty: 'Easy' },
  { word: 'Skateboard', category: 'Food & Objects', difficulty: 'Easy' },
  { word: 'Birthday Cake', category: 'Food & Objects', difficulty: 'Easy' },
  { word: 'Popcorn', category: 'Food & Objects', difficulty: 'Easy' },
  { word: 'Toothbrush', category: 'Food & Objects', difficulty: 'Easy' },
  { word: 'Hot Dog', category: 'Food & Objects', difficulty: 'Easy' },
  { word: 'Pineapple', category: 'Food & Objects', difficulty: 'Easy' },
  { word: 'Toaster', category: 'Food & Objects', difficulty: 'Medium' },
  { word: 'Lawnmower', category: 'Food & Objects', difficulty: 'Medium' },
  { word: 'Fire Extinguisher', category: 'Food & Objects', difficulty: 'Medium' },
  { word: 'Hourglass', category: 'Food & Objects', difficulty: 'Medium' },
  { word: 'Spaghetti and Meatballs', category: 'Food & Objects', difficulty: 'Medium' },
  { word: 'Treasure Chest', category: 'Food & Objects', difficulty: 'Medium' },
  { word: 'Shopping Cart', category: 'Food & Objects', difficulty: 'Medium' },
  { word: 'Telescope', category: 'Food & Objects', difficulty: 'Medium' },
  { word: 'Swiss Army Knife', category: 'Food & Objects', difficulty: 'Medium' },
  { word: 'Cuckoo Clock', category: 'Food & Objects', difficulty: 'Medium' },
  { word: 'Vending Machine', category: 'Food & Objects', difficulty: 'Medium' },
  { word: 'Sushi Roll', category: 'Food & Objects', difficulty: 'Medium' },
  { word: 'Espresso Machine', category: 'Food & Objects', difficulty: 'Hard' },
  { word: 'Chandelier', category: 'Food & Objects', difficulty: 'Hard' },
  { word: 'Grandfather Clock', category: 'Food & Objects', difficulty: 'Hard' },
  { word: 'Gingerbread House', category: 'Food & Objects', difficulty: 'Hard' },
  { word: 'Jackhammer', category: 'Food & Objects', difficulty: 'Hard' },
  { word: 'Sewing Machine', category: 'Food & Objects', difficulty: 'Hard' },
  { word: 'Pinball Machine', category: 'Food & Objects', difficulty: 'Hard' },

  // ==========================================================================
  // ACTIONS & PHRASES
  // ==========================================================================
  { word: 'Jump Rope', category: 'Actions & Phrases', difficulty: 'Easy' },
  { word: 'Fishing', category: 'Actions & Phrases', difficulty: 'Easy' },
  { word: 'Crying', category: 'Actions & Phrases', difficulty: 'Easy' },
  { word: 'Sleeping', category: 'Actions & Phrases', difficulty: 'Easy' },
  { word: 'Bowling', category: 'Actions & Phrases', difficulty: 'Easy' },
  { word: 'Surfing', category: 'Actions & Phrases', difficulty: 'Easy' },
  { word: 'Walking the Dog', category: 'Actions & Phrases', difficulty: 'Easy' },
  { word: 'Taking a Selfie', category: 'Actions & Phrases', difficulty: 'Easy' },
  { word: 'Lifting Weights', category: 'Actions & Phrases', difficulty: 'Easy' },
  { word: 'Skydiving', category: 'Actions & Phrases', difficulty: 'Medium' },
  { word: 'Juggling', category: 'Actions & Phrases', difficulty: 'Medium' },
  { word: 'Bungee Jumping', category: 'Actions & Phrases', difficulty: 'Medium' },
  { word: 'Tightrope Walking', category: 'Actions & Phrases', difficulty: 'Medium' },
  { word: 'Slipping on a Banana Peel', category: 'Actions & Phrases', difficulty: 'Medium' },
  { word: 'Scuba Diving', category: 'Actions & Phrases', difficulty: 'Medium' },
  { word: 'Rock Climbing', category: 'Actions & Phrases', difficulty: 'Medium' },
  { word: 'Roasting Marshmallows', category: 'Actions & Phrases', difficulty: 'Medium' },
  { word: 'Milking a Cow', category: 'Actions & Phrases', difficulty: 'Medium' },
  { word: 'Changing a Flat Tire', category: 'Actions & Phrases', difficulty: 'Medium' },
  { word: 'Flipping a Pancake', category: 'Actions & Phrases', difficulty: 'Medium' },
  { word: 'Sleepwalking', category: 'Actions & Phrases', difficulty: 'Hard' },
  { word: 'Brainstorming', category: 'Actions & Phrases', difficulty: 'Hard' },
  { word: 'Time Flies', category: 'Actions & Phrases', difficulty: 'Hard' },
  { word: 'Raining Cats and Dogs', category: 'Actions & Phrases', difficulty: 'Hard' },
  { word: 'Butterflies in Stomach', category: 'Actions & Phrases', difficulty: 'Hard' },
  { word: 'Missing the Bus', category: 'Actions & Phrases', difficulty: 'Hard' },
  { word: 'Parallel Parking', category: 'Actions & Phrases', difficulty: 'Hard' },
  { word: 'Catching a Cold', category: 'Actions & Phrases', difficulty: 'Hard' },

  // ==========================================================================
  // POP CULTURE & MOVIES
  // ==========================================================================
  { word: 'Spider-Man', category: 'Pop Culture & Movies', difficulty: 'Easy' },
  { word: 'Harry Potter', category: 'Pop Culture & Movies', difficulty: 'Easy' },
  { word: 'Pikachu', category: 'Pop Culture & Movies', difficulty: 'Easy' },
  { word: 'Batman', category: 'Pop Culture & Movies', difficulty: 'Easy' },
  { word: 'Lightsaber', category: 'Pop Culture & Movies', difficulty: 'Easy' },
  { word: 'SpongeBob', category: 'Pop Culture & Movies', difficulty: 'Easy' },
  { word: 'Super Mario', category: 'Pop Culture & Movies', difficulty: 'Easy' },
  { word: 'Shrek', category: 'Pop Culture & Movies', difficulty: 'Easy' },
  { word: 'Darth Vader', category: 'Pop Culture & Movies', difficulty: 'Medium' },
  { word: 'Titanic', category: 'Pop Culture & Movies', difficulty: 'Medium' },
  { word: 'Jurassic Park', category: 'Pop Culture & Movies', difficulty: 'Medium' },
  { word: 'King Kong', category: 'Pop Culture & Movies', difficulty: 'Medium' },
  { word: 'Ghostbusters', category: 'Pop Culture & Movies', difficulty: 'Medium' },
  { word: 'Finding Nemo', category: 'Pop Culture & Movies', difficulty: 'Medium' },
  { word: 'The Lion King', category: 'Pop Culture & Movies', difficulty: 'Medium' },
  { word: 'Indiana Jones', category: 'Pop Culture & Movies', difficulty: 'Medium' },
  { word: 'Sherlock Holmes', category: 'Pop Culture & Movies', difficulty: 'Medium' },
  { word: 'Godzilla', category: 'Pop Culture & Movies', difficulty: 'Medium' },
  { word: 'Back to the Future', category: 'Pop Culture & Movies', difficulty: 'Hard' },
  { word: 'The Matrix', category: 'Pop Culture & Movies', difficulty: 'Hard' },
  { word: 'Pirates of the Caribbean', category: 'Pop Culture & Movies', difficulty: 'Hard' },
  { word: 'Wizard of Oz', category: 'Pop Culture & Movies', difficulty: 'Hard' },
  { word: 'Beauty and the Beast', category: 'Pop Culture & Movies', difficulty: 'Hard' },
  { word: 'Lord of the Rings', category: 'Pop Culture & Movies', difficulty: 'Hard' },

  // ==========================================================================
  // EVERYDAY LIFE
  // ==========================================================================
  { word: 'Campfire', category: 'Everyday Life', difficulty: 'Easy' },
  { word: 'Snowman', category: 'Everyday Life', difficulty: 'Easy' },
  { word: 'Airplane', category: 'Everyday Life', difficulty: 'Easy' },
  { word: 'Helicopter', category: 'Everyday Life', difficulty: 'Easy' },
  { word: 'Fire Truck', category: 'Everyday Life', difficulty: 'Easy' },
  { word: 'Lighthouse', category: 'Everyday Life', difficulty: 'Easy' },
  { word: 'Castle', category: 'Everyday Life', difficulty: 'Easy' },
  { word: 'Roller Coaster', category: 'Everyday Life', difficulty: 'Medium' },
  { word: 'Ferris Wheel', category: 'Everyday Life', difficulty: 'Medium' },
  { word: 'Treehouse', category: 'Everyday Life', difficulty: 'Medium' },
  { word: 'Hot Air Balloon', category: 'Everyday Life', difficulty: 'Medium' },
  { word: 'Haunted House', category: 'Everyday Life', difficulty: 'Medium' },
  { word: 'Traffic Jam', category: 'Everyday Life', difficulty: 'Medium' },
  { word: 'Dentist Chair', category: 'Everyday Life', difficulty: 'Medium' },
  { word: 'Pirate Ship', category: 'Everyday Life', difficulty: 'Medium' },
  { word: 'Submarine', category: 'Everyday Life', difficulty: 'Medium' },
  { word: 'Space Station', category: 'Everyday Life', difficulty: 'Hard' },
  { word: 'Airport Security', category: 'Everyday Life', difficulty: 'Hard' },
  { word: 'Escalator', category: 'Everyday Life', difficulty: 'Hard' },
  { word: 'Car Wash', category: 'Everyday Life', difficulty: 'Hard' },
  { word: 'Bowling Alley', category: 'Everyday Life', difficulty: 'Hard' },
  { word: 'Mount Rushmore', category: 'Everyday Life', difficulty: 'Hard' },
  { word: 'Statue of Liberty', category: 'Everyday Life', difficulty: 'Hard' },
  { word: 'Eiffel Tower', category: 'Everyday Life', difficulty: 'Easy' },
];

/**
 * Generates a masked letter hint for phone screens without revealing the word.
 * Example: "Ice Cream" -> "_ _ _   _ _ _ _ _ (3, 5)"
 */
export function createMaskedWordHint(word: string): string {
  const parts = word.trim().split(/\s+/);
  const blanks = parts
    .map((part) =>
      part
        .split('')
        .map((ch) => (/[a-zA-Z0-9]/.test(ch) ? '_' : ch))
        .join(' ')
    )
    .join('   ');
  const lengths = parts.map((p) => p.replace(/[^a-zA-Z0-9]/g, '').length).join(', ');
  return `${blanks}  (${lengths})`;
}

/**
 * Filters and shuffles words matching the chosen category and difficulty.
 */
export function buildShuffledDeck(
  category: WordCategory,
  difficulty: WordDifficulty
): WordEntry[] {
  let pool = WORD_BANK.filter((entry) => {
    const matchesCategory = category === 'All' || entry.category === category;
    const matchesDifficulty =
      difficulty === 'All' || entry.difficulty === difficulty;
    return matchesCategory && matchesDifficulty;
  });

  if (pool.length === 0) {
    pool = [...WORD_BANK];
  } else {
    pool = [...pool];
  }

  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = pool[i];
    pool[i] = pool[j];
    pool[j] = temp;
  }

  return pool;
}
