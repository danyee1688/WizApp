import 'dotenv/config';
import { capitalize, InstallGlobalCommands } from './utils.js';

// Simple test command
const TEST_COMMAND = {
  name: 'test',
  description: 'Basic command',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

// Start wizardry journey
const START_COMMAND = {
  name: 'start',
  description: 'Start your wizardry adventure!',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const ARENA_COMMAND = {
  name: 'arena',
  description: 'Start a grand wizardry fight',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};

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

const ADVENTURE_COMMAND = {
  name: 'adventure',
  description: 'Take a wild leap into the woods',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
}

const SHOP_COMMAND = {
  name: 'shop',
  description: 'Purchase loot chests to upgrade your wizard!',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
}

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

const ALL_COMMANDS = [
  TEST_COMMAND, 
  START_COMMAND, 
  ARENA_COMMAND, 
  WIZARD_COMMAND, 
  ADVENTURE_COMMAND, 
  SHOP_COMMAND,
  DUEL_COMMAND,
  WIKI_COMMAND,
];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
