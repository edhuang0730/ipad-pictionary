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
  // ANIMALS & NATURE (20 Easy, 20 Medium, 20 Hard)
  // ==========================================================================
  // Easy (20)
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
  { word: 'Elephant', category: 'Animals & Nature', difficulty: 'Easy' },
  { word: 'Turtle', category: 'Animals & Nature', difficulty: 'Easy' },
  { word: 'Sunflower', category: 'Animals & Nature', difficulty: 'Easy' },
  { word: 'Ladybug', category: 'Animals & Nature', difficulty: 'Easy' },
  { word: 'Snail', category: 'Animals & Nature', difficulty: 'Easy' },
  { word: 'Dolphin', category: 'Animals & Nature', difficulty: 'Easy' },

  // Medium (20)
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
  { word: 'Woodpecker', category: 'Animals & Nature', difficulty: 'Medium' },
  { word: 'Pelican', category: 'Animals & Nature', difficulty: 'Medium' },
  { word: 'Sloth', category: 'Animals & Nature', difficulty: 'Medium' },
  { word: 'Waterfall', category: 'Animals & Nature', difficulty: 'Medium' },
  { word: 'Hermit Crab', category: 'Animals & Nature', difficulty: 'Medium' },
  { word: 'Raccoon', category: 'Animals & Nature', difficulty: 'Medium' },
  { word: 'Koala', category: 'Animals & Nature', difficulty: 'Medium' },
  { word: 'Lightning Bolt', category: 'Animals & Nature', difficulty: 'Medium' },

  // Hard (20)
  { word: 'Platypus', category: 'Animals & Nature', difficulty: 'Hard' },
  { word: 'Northern Lights', category: 'Animals & Nature', difficulty: 'Hard' },
  { word: 'Hibernation', category: 'Animals & Nature', difficulty: 'Hard' },
  { word: 'Photosynthesis', category: 'Animals & Nature', difficulty: 'Hard' },
  { word: 'Praying Mantis', category: 'Animals & Nature', difficulty: 'Hard' },
  { word: 'Coral Reef', category: 'Animals & Nature', difficulty: 'Hard' },
  { word: 'Metamorphosis', category: 'Animals & Nature', difficulty: 'Hard' },
  { word: 'Solar Eclipse', category: 'Animals & Nature', difficulty: 'Hard' },
  { word: 'Narwhal', category: 'Animals & Nature', difficulty: 'Hard' },
  { word: 'Tumbleweed', category: 'Animals & Nature', difficulty: 'Hard' },
  { word: 'Quicksand', category: 'Animals & Nature', difficulty: 'Hard' },
  { word: 'Bioluminescence', category: 'Animals & Nature', difficulty: 'Hard' },
  { word: 'Pangolin', category: 'Animals & Nature', difficulty: 'Hard' },
  { word: 'Geyser', category: 'Animals & Nature', difficulty: 'Hard' },
  { word: 'Stalactite', category: 'Animals & Nature', difficulty: 'Hard' },
  { word: 'Axolotl', category: 'Animals & Nature', difficulty: 'Hard' },
  { word: 'Tidal Wave', category: 'Animals & Nature', difficulty: 'Hard' },
  { word: 'Dandelion Seeds', category: 'Animals & Nature', difficulty: 'Hard' },
  { word: 'Komodo Dragon', category: 'Animals & Nature', difficulty: 'Hard' },
  { word: 'Constellation', category: 'Animals & Nature', difficulty: 'Hard' },

  // ==========================================================================
  // FOOD & OBJECTS (20 Easy, 20 Medium, 20 Hard)
  // ==========================================================================
  // Easy (20)
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
  { word: 'Donut', category: 'Food & Objects', difficulty: 'Easy' },
  { word: 'Pretzel', category: 'Food & Objects', difficulty: 'Easy' },
  { word: 'Watermelon', category: 'Food & Objects', difficulty: 'Easy' },
  { word: 'Frying Pan', category: 'Food & Objects', difficulty: 'Easy' },
  { word: 'Keyhole', category: 'Food & Objects', difficulty: 'Easy' },

  // Medium (20)
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
  { word: 'Blender', category: 'Food & Objects', difficulty: 'Medium' },
  { word: 'Waffle Iron', category: 'Food & Objects', difficulty: 'Medium' },
  { word: 'Bubble Tea', category: 'Food & Objects', difficulty: 'Medium' },
  { word: 'Binoculars', category: 'Food & Objects', difficulty: 'Medium' },
  { word: 'Stapler', category: 'Food & Objects', difficulty: 'Medium' },
  { word: 'Fortune Cookie', category: 'Food & Objects', difficulty: 'Medium' },
  { word: 'Lock and Key', category: 'Food & Objects', difficulty: 'Medium' },
  { word: 'Microscope', category: 'Food & Objects', difficulty: 'Medium' },

  // Hard (20)
  { word: 'Espresso Machine', category: 'Food & Objects', difficulty: 'Hard' },
  { word: 'Chandelier', category: 'Food & Objects', difficulty: 'Hard' },
  { word: 'Grandfather Clock', category: 'Food & Objects', difficulty: 'Hard' },
  { word: 'Gingerbread House', category: 'Food & Objects', difficulty: 'Hard' },
  { word: 'Jackhammer', category: 'Food & Objects', difficulty: 'Hard' },
  { word: 'Sewing Machine', category: 'Food & Objects', difficulty: 'Hard' },
  { word: 'Pinball Machine', category: 'Food & Objects', difficulty: 'Hard' },
  { word: 'Swiss Cheese', category: 'Food & Objects', difficulty: 'Hard' },
  { word: 'Gramophone', category: 'Food & Objects', difficulty: 'Hard' },
  { word: 'Typewriter', category: 'Food & Objects', difficulty: 'Hard' },
  { word: 'Metronome', category: 'Food & Objects', difficulty: 'Hard' },
  { word: 'Pocket Watch', category: 'Food & Objects', difficulty: 'Hard' },
  { word: 'Accordion', category: 'Food & Objects', difficulty: 'Hard' },
  { word: 'Lava Lamp', category: 'Food & Objects', difficulty: 'Hard' },
  { word: 'Compass Rose', category: 'Food & Objects', difficulty: 'Hard' },
  { word: 'Kaleidoscope', category: 'Food & Objects', difficulty: 'Hard' },
  { word: 'Fondue Pot', category: 'Food & Objects', difficulty: 'Hard' },
  { word: 'Sextant', category: 'Food & Objects', difficulty: 'Hard' },
  { word: 'Abacus', category: 'Food & Objects', difficulty: 'Hard' },
  { word: 'Periscope', category: 'Food & Objects', difficulty: 'Hard' },

  // ==========================================================================
  // ACTIONS & PHRASES (20 Easy, 20 Medium, 20 Hard)
  // ==========================================================================
  // Easy (20)
  { word: 'Jump Rope', category: 'Actions & Phrases', difficulty: 'Easy' },
  { word: 'Fishing', category: 'Actions & Phrases', difficulty: 'Easy' },
  { word: 'Crying', category: 'Actions & Phrases', difficulty: 'Easy' },
  { word: 'Sleeping', category: 'Actions & Phrases', difficulty: 'Easy' },
  { word: 'Bowling', category: 'Actions & Phrases', difficulty: 'Easy' },
  { word: 'Surfing', category: 'Actions & Phrases', difficulty: 'Easy' },
  { word: 'Walking the Dog', category: 'Actions & Phrases', difficulty: 'Easy' },
  { word: 'Taking a Selfie', category: 'Actions & Phrases', difficulty: 'Easy' },
  { word: 'Lifting Weights', category: 'Actions & Phrases', difficulty: 'Easy' },
  { word: 'Brushing Teeth', category: 'Actions & Phrases', difficulty: 'Easy' },
  { word: 'Blowing Bubbles', category: 'Actions & Phrases', difficulty: 'Easy' },
  { word: 'Flying a Kite', category: 'Actions & Phrases', difficulty: 'Easy' },
  { word: 'Riding a Bike', category: 'Actions & Phrases', difficulty: 'Easy' },
  { word: 'Building a Sandcastle', category: 'Actions & Phrases', difficulty: 'Easy' },
  { word: 'Playing Guitar', category: 'Actions & Phrases', difficulty: 'Easy' },
  { word: 'Singing in the Shower', category: 'Actions & Phrases', difficulty: 'Easy' },
  { word: 'Jumping on a Bed', category: 'Actions & Phrases', difficulty: 'Easy' },
  { word: 'Throwing a Snowball', category: 'Actions & Phrases', difficulty: 'Easy' },
  { word: 'Reading a Book', category: 'Actions & Phrases', difficulty: 'Easy' },
  { word: 'Painting a Picture', category: 'Actions & Phrases', difficulty: 'Easy' },

  // Medium (20)
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
  { word: 'Hula Hooping', category: 'Actions & Phrases', difficulty: 'Medium' },
  { word: 'Archery', category: 'Actions & Phrases', difficulty: 'Medium' },
  { word: 'Lassoing a Horse', category: 'Actions & Phrases', difficulty: 'Medium' },
  { word: 'Playing Tug of War', category: 'Actions & Phrases', difficulty: 'Medium' },
  { word: 'Chopping Wood', category: 'Actions & Phrases', difficulty: 'Medium' },
  { word: 'Mowing the Lawn', category: 'Actions & Phrases', difficulty: 'Medium' },
  { word: 'Blowing Out Candles', category: 'Actions & Phrases', difficulty: 'Medium' },
  { word: 'Digging for Treasure', category: 'Actions & Phrases', difficulty: 'Medium' },
  { word: 'Arm Wrestling', category: 'Actions & Phrases', difficulty: 'Medium' },

  // Hard (20)
  { word: 'Sleepwalking', category: 'Actions & Phrases', difficulty: 'Hard' },
  { word: 'Brainstorming', category: 'Actions & Phrases', difficulty: 'Hard' },
  { word: 'Time Flies', category: 'Actions & Phrases', difficulty: 'Hard' },
  { word: 'Raining Cats and Dogs', category: 'Actions & Phrases', difficulty: 'Hard' },
  { word: 'Butterflies in Stomach', category: 'Actions & Phrases', difficulty: 'Hard' },
  { word: 'Missing the Bus', category: 'Actions & Phrases', difficulty: 'Hard' },
  { word: 'Parallel Parking', category: 'Actions & Phrases', difficulty: 'Hard' },
  { word: 'Catching a Cold', category: 'Actions & Phrases', difficulty: 'Hard' },
  { word: 'Spilling the Beans', category: 'Actions & Phrases', difficulty: 'Hard' },
  { word: 'Cold Feet', category: 'Actions & Phrases', difficulty: 'Hard' },
  { word: 'Barking Up the Wrong Tree', category: 'Actions & Phrases', difficulty: 'Hard' },
  { word: 'Biting Off More Than You Can Chew', category: 'Actions & Phrases', difficulty: 'Hard' },
  { word: 'Burning the Midnight Oil', category: 'Actions & Phrases', difficulty: 'Hard' },
  { word: 'Needle in a Haystack', category: 'Actions & Phrases', difficulty: 'Hard' },
  { word: 'Walking on Eggshells', category: 'Actions & Phrases', difficulty: 'Hard' },
  { word: 'Crying Over Spilt Milk', category: 'Actions & Phrases', difficulty: 'Hard' },
  { word: 'Piece of Cake', category: 'Actions & Phrases', difficulty: 'Hard' },
  { word: 'Break the Ice', category: 'Actions & Phrases', difficulty: 'Hard' },
  { word: 'Hit the Nail on the Head', category: 'Actions & Phrases', difficulty: 'Hard' },
  { word: 'Elephant in the Room', category: 'Actions & Phrases', difficulty: 'Hard' },

  // ==========================================================================
  // POP CULTURE & MOVIES (20 Easy, 20 Medium, 20 Hard)
  // ==========================================================================
  // Easy (20)
  { word: 'Spider-Man', category: 'Pop Culture & Movies', difficulty: 'Easy' },
  { word: 'Harry Potter', category: 'Pop Culture & Movies', difficulty: 'Easy' },
  { word: 'Pikachu', category: 'Pop Culture & Movies', difficulty: 'Easy' },
  { word: 'Batman', category: 'Pop Culture & Movies', difficulty: 'Easy' },
  { word: 'Lightsaber', category: 'Pop Culture & Movies', difficulty: 'Easy' },
  { word: 'SpongeBob', category: 'Pop Culture & Movies', difficulty: 'Easy' },
  { word: 'Super Mario', category: 'Pop Culture & Movies', difficulty: 'Easy' },
  { word: 'Shrek', category: 'Pop Culture & Movies', difficulty: 'Easy' },
  { word: 'Mickey Mouse', category: 'Pop Culture & Movies', difficulty: 'Easy' },
  { word: 'Superman', category: 'Pop Culture & Movies', difficulty: 'Easy' },
  { word: 'Minions', category: 'Pop Culture & Movies', difficulty: 'Easy' },
  { word: 'Captain America', category: 'Pop Culture & Movies', difficulty: 'Easy' },
  { word: 'Pac-Man', category: 'Pop Culture & Movies', difficulty: 'Easy' },
  { word: 'Winnie the Pooh', category: 'Pop Culture & Movies', difficulty: 'Easy' },
  { word: 'Sonic the Hedgehog', category: 'Pop Culture & Movies', difficulty: 'Easy' },
  { word: 'Olaf', category: 'Pop Culture & Movies', difficulty: 'Easy' },
  { word: 'Yoda', category: 'Pop Culture & Movies', difficulty: 'Easy' },
  { word: 'Hulk', category: 'Pop Culture & Movies', difficulty: 'Easy' },
  { word: 'Cookie Monster', category: 'Pop Culture & Movies', difficulty: 'Easy' },
  { word: 'Hello Kitty', category: 'Pop Culture & Movies', difficulty: 'Easy' },

  // Medium (20)
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
  { word: 'Toy Story', category: 'Pop Culture & Movies', difficulty: 'Medium' },
  { word: 'Aladdin', category: 'Pop Culture & Movies', difficulty: 'Medium' },
  { word: 'Jaws', category: 'Pop Culture & Movies', difficulty: 'Medium' },
  { word: 'Frozen', category: 'Pop Culture & Movies', difficulty: 'Medium' },
  { word: 'Monsters, Inc.', category: 'Pop Culture & Movies', difficulty: 'Medium' },
  { word: 'Iron Man', category: 'Pop Culture & Movies', difficulty: 'Medium' },
  { word: 'Wolverine', category: 'Pop Culture & Movies', difficulty: 'Medium' },
  { word: 'The Little Mermaid', category: 'Pop Culture & Movies', difficulty: 'Medium' },
  { word: 'Up', category: 'Pop Culture & Movies', difficulty: 'Medium' },
  { word: 'Kung Fu Panda', category: 'Pop Culture & Movies', difficulty: 'Medium' },

  // Hard (20)
  { word: 'Back to the Future', category: 'Pop Culture & Movies', difficulty: 'Hard' },
  { word: 'The Matrix', category: 'Pop Culture & Movies', difficulty: 'Hard' },
  { word: 'Pirates of the Caribbean', category: 'Pop Culture & Movies', difficulty: 'Hard' },
  { word: 'Wizard of Oz', category: 'Pop Culture & Movies', difficulty: 'Hard' },
  { word: 'Beauty and the Beast', category: 'Pop Culture & Movies', difficulty: 'Hard' },
  { word: 'Lord of the Rings', category: 'Pop Culture & Movies', difficulty: 'Hard' },
  { word: 'Inception', category: 'Pop Culture & Movies', difficulty: 'Hard' },
  { word: 'WALL-E', category: 'Pop Culture & Movies', difficulty: 'Hard' },
  { word: 'Ratatouille', category: 'Pop Culture & Movies', difficulty: 'Hard' },
  { word: 'The Avengers', category: 'Pop Culture & Movies', difficulty: 'Hard' },
  { word: 'Stranger Things', category: 'Pop Culture & Movies', difficulty: 'Hard' },
  { word: 'Avatar', category: 'Pop Culture & Movies', difficulty: 'Hard' },
  { word: 'E.T. the Extra-Terrestrial', category: 'Pop Culture & Movies', difficulty: 'Hard' },
  { word: 'Forrest Gump', category: 'Pop Culture & Movies', difficulty: 'Hard' },
  { word: 'Home Alone', category: 'Pop Culture & Movies', difficulty: 'Hard' },
  { word: 'Charlie and the Chocolate Factory', category: 'Pop Culture & Movies', difficulty: 'Hard' },
  { word: 'Nightmare Before Christmas', category: 'Pop Culture & Movies', difficulty: 'Hard' },
  { word: 'Guardians of the Galaxy', category: 'Pop Culture & Movies', difficulty: 'Hard' },
  { word: 'How to Train Your Dragon', category: 'Pop Culture & Movies', difficulty: 'Hard' },
  { word: 'Doctor Strange', category: 'Pop Culture & Movies', difficulty: 'Hard' },

  // ==========================================================================
  // EVERYDAY LIFE (20 Easy, 20 Medium, 20 Hard)
  // ==========================================================================
  // Easy (20)
  { word: 'Campfire', category: 'Everyday Life', difficulty: 'Easy' },
  { word: 'Snowman', category: 'Everyday Life', difficulty: 'Easy' },
  { word: 'Airplane', category: 'Everyday Life', difficulty: 'Easy' },
  { word: 'Helicopter', category: 'Everyday Life', difficulty: 'Easy' },
  { word: 'Fire Truck', category: 'Everyday Life', difficulty: 'Easy' },
  { word: 'Lighthouse', category: 'Everyday Life', difficulty: 'Easy' },
  { word: 'Castle', category: 'Everyday Life', difficulty: 'Easy' },
  { word: 'Eiffel Tower', category: 'Everyday Life', difficulty: 'Easy' },
  { word: 'Igloo', category: 'Everyday Life', difficulty: 'Easy' },
  { word: 'Tent', category: 'Everyday Life', difficulty: 'Easy' },
  { word: 'School Bus', category: 'Everyday Life', difficulty: 'Easy' },
  { word: 'Traffic Light', category: 'Everyday Life', difficulty: 'Easy' },
  { word: 'Mailbox', category: 'Everyday Life', difficulty: 'Easy' },
  { word: 'Bunk Bed', category: 'Everyday Life', difficulty: 'Easy' },
  { word: 'Slide', category: 'Everyday Life', difficulty: 'Easy' },
  { word: 'Swing Set', category: 'Everyday Life', difficulty: 'Easy' },
  { word: 'Train Track', category: 'Everyday Life', difficulty: 'Easy' },
  { word: 'Bathtub', category: 'Everyday Life', difficulty: 'Easy' },
  { word: 'Snow Globe', category: 'Everyday Life', difficulty: 'Easy' },
  { word: 'Windmill', category: 'Everyday Life', difficulty: 'Easy' },

  // Medium (20)
  { word: 'Roller Coaster', category: 'Everyday Life', difficulty: 'Medium' },
  { word: 'Ferris Wheel', category: 'Everyday Life', difficulty: 'Medium' },
  { word: 'Treehouse', category: 'Everyday Life', difficulty: 'Medium' },
  { word: 'Hot Air Balloon', category: 'Everyday Life', difficulty: 'Medium' },
  { word: 'Haunted House', category: 'Everyday Life', difficulty: 'Medium' },
  { word: 'Traffic Jam', category: 'Everyday Life', difficulty: 'Medium' },
  { word: 'Dentist Chair', category: 'Everyday Life', difficulty: 'Medium' },
  { word: 'Pirate Ship', category: 'Everyday Life', difficulty: 'Medium' },
  { word: 'Submarine', category: 'Everyday Life', difficulty: 'Medium' },
  { word: 'Ambulance', category: 'Everyday Life', difficulty: 'Medium' },
  { word: 'Shopping Mall', category: 'Everyday Life', difficulty: 'Medium' },
  { word: 'Gas Station', category: 'Everyday Life', difficulty: 'Medium' },
  { word: 'Playground', category: 'Everyday Life', difficulty: 'Medium' },
  { word: 'Fountain', category: 'Everyday Life', difficulty: 'Medium' },
  { word: 'Hammock', category: 'Everyday Life', difficulty: 'Medium' },
  { word: 'Drawbridge', category: 'Everyday Life', difficulty: 'Medium' },
  { word: 'Ski Lift', category: 'Everyday Life', difficulty: 'Medium' },
  { word: 'Bus Stop', category: 'Everyday Life', difficulty: 'Medium' },
  { word: 'Doghouse', category: 'Everyday Life', difficulty: 'Medium' },
  { word: 'Scarecrow', category: 'Everyday Life', difficulty: 'Medium' },

  // Hard (20)
  { word: 'Space Station', category: 'Everyday Life', difficulty: 'Hard' },
  { word: 'Airport Security', category: 'Everyday Life', difficulty: 'Hard' },
  { word: 'Escalator', category: 'Everyday Life', difficulty: 'Hard' },
  { word: 'Car Wash', category: 'Everyday Life', difficulty: 'Hard' },
  { word: 'Bowling Alley', category: 'Everyday Life', difficulty: 'Hard' },
  { word: 'Mount Rushmore', category: 'Everyday Life', difficulty: 'Hard' },
  { word: 'Statue of Liberty', category: 'Everyday Life', difficulty: 'Hard' },
  { word: 'Drive-In Theater', category: 'Everyday Life', difficulty: 'Hard' },
  { word: 'Laundromat', category: 'Everyday Life', difficulty: 'Hard' },
  { word: 'Revolving Door', category: 'Everyday Life', difficulty: 'Hard' },
  { word: 'Baggage Claim', category: 'Everyday Life', difficulty: 'Hard' },
  { word: 'Suspension Bridge', category: 'Everyday Life', difficulty: 'Hard' },
  { word: 'Greenhouse', category: 'Everyday Life', difficulty: 'Hard' },
  { word: 'Observatory', category: 'Everyday Life', difficulty: 'Hard' },
  { word: 'Leaning Tower of Pisa', category: 'Everyday Life', difficulty: 'Hard' },
  { word: 'Great Wall of China', category: 'Everyday Life', difficulty: 'Hard' },
  { word: 'Assembly Line', category: 'Everyday Life', difficulty: 'Hard' },
  { word: 'Subway Station', category: 'Everyday Life', difficulty: 'Hard' },
  { word: 'Toll Booth', category: 'Everyday Life', difficulty: 'Hard' },
  { word: 'Oil Rig', category: 'Everyday Life', difficulty: 'Hard' },
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
