import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

// Simple test command
const TEST_COMMAND = {
  name: 'test',
  description: 'See if Wiz is up and running',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

// Start wizardry journey
// User will have a modal pop up prompting them to 
// name their wizard if necessary
const START_COMMAND = {
  name: 'start',
  description: 'Start your wizardry adventure!',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

// Start an arena
// Users with wizards can join the arena 
// Wizards fight each other in a battle-royale style arena
const ARENA_COMMAND = {
  name: 'arena',
  description: 'Start a grand wizardry fight',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};

// View a wizard
// View a wizard and their details such as spells
// Currently can view spells, inventory, and fish barrel
// If no parameter, view the wizard of the user who 
// used the command
const WIZARD_COMMAND = {
  name: 'wizard',
  description: 'View a wizard and their gear',
  type: 1,
  options: [
    {
      name: 'user',
      type: 6, // USERS
      description: 'target user',
      required: false,
    }
  ],
  integration_types: [0, 1],
  contexts: [0, 1, 2],
}

// Embark on an adventure
// Fight an enemy
// Win and you gain gold, lose and you gain nothing
const ADVENTURE_COMMAND = {
  name: 'adventure',
  description: 'Take a wild leap into the woods',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
}

// Open the shop
// Buy lootboxes at the shop for 500 gold
// Other users can also buy at the same shop
const SHOP_COMMAND = {
  name: 'shop',
  description: 'Purchase loot chests to upgrade your wizard!',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
}

// Challenge a wizard to a duel
// Start a 1v1 against another wizard
// Other user has to accept prompt first
const DUEL_COMMAND = {
  name: 'duel',
  description: 'Challenge another wizard to a duel!',
  type: 1,
  options: [
    {
      name: 'user',
      type: 6, // USERS
      description: 'select a user to duel it out, wizard style',
      required: true,
    }
  ],
  integration_types: [0, 1],
  contexts: [0, 2],
}

// Get information on mechanics
// Read about mechanics present in Wiz
// Parameter required to know which entry to view
const WIKI_COMMAND = {
  name: 'wiki',
  description: 'Learn more about mechanics in Wiz',
  type: 1,
  options: [
    {
      name: 'entry',
      type: 3,
      description: 'select an entry to view',
      required: true,
      choices: [
        {
          name: 'Strength',
          value: 'Strength',
        },
        {
          name: 'Dexterity',
          value: 'Dexterity',
        },
        {
          name: 'Intelligence',
          value: 'Intelligence',
        },
        {
          name: 'Critical Hits',
          value: 'Critical Hits',
        },
        {
          name: 'Resistances',
          value: 'Resistances',
        },
        {
          name: 'Items',
          value: 'Items',
        },
        {
          name: 'Spells',
          value: 'Spells',
        },
        {
          name: 'Damage',
          value: 'Damage',
        },
      ],
    }
  ],
  integration_types: [0, 1],
  contexts: [0, 1, 2],
}

// Fishing minigame
// Test your reaction time with a simple square diagram
// Sell or keep the fish
const FISH_COMMAND = {
  name: 'fish',
  description: 'Test your luck and reflexes fishing in a nearby pond',
  type: 1,
  integration_types: [0, 1],
  contexts:[0, 1, 2],
}

// Gamble a specified amount of your gold 
// Either win double your wager or lose your wager
const GAMBLE_COMMAND = {
  name: 'gamble',
  description: 'Gamble away your hard earned gold with a simple flip of a coin',
  type: 1,
  options: [
    {
      name: 'amount',
      type: 10,
      description: 'Select how much of your gold you wish to gamble',
      required: true,
      choices: [
        {
          name: 'All',
          value: 1
        },
        {
          name: 'Half',
          value: 0.5
        },
        {
          name: 'Quarter',
          value: 0.25
        }
      ]
    },
    {
      name: 'side',
      type: 4,
      description: 'Select a coin side',
      required: true,
      choices: [
        {
          name: 'Heads',
          value: 1,
        },
        {
          name: 'Tails',
          value: 0
        }
      ]
    }
  ],
  integration_types: [0, 1],
  contexts:[0, 1, 2],
}

// Ponder the orb
// AI-generated response to prompt using gpt-4o-mini
const PONDER_COMMAND = {
  name: 'ponder',
  description: 'Ponder the orb of infinite wisdom',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
}

const ALL_COMMANDS = [
  TEST_COMMAND, 
  START_COMMAND, 
  ARENA_COMMAND, 
  WIZARD_COMMAND, 
  ADVENTURE_COMMAND, 
  SHOP_COMMAND,
  DUEL_COMMAND,
  WIKI_COMMAND,
  FISH_COMMAND,
  GAMBLE_COMMAND,
  PONDER_COMMAND,
];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
