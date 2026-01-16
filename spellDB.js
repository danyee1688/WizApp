import { weightedChoice } from './chance.js';
import { Spell } from './spell.js';
import {
  ButtonStyleTypes,
  MessageComponentTypes,
} from 'discord-interactions';

// Base damage is [SCORCH, VOLT, FREEZE]
export class SpellDB {
    // Spell(ID, tier, name, damage, critChance, critDamage, tags)
    static spellList = {
        // Fireball
        0: [
            new Spell(0, 1, "Fireball", 
                [40, 0, 0],
                10, 150,
                [
                    "Scorch",
                    "Projectile",
                ]
            ),
            new Spell(0, 2, "Fireball", 
                [45, 0, 0],
                10, 150,
                [
                    "Scorch",
                    "Projectile",
                ]
            ),
            new Spell(0, 3, "Fireball", 
                [51, 0, 0],
                10, 150,
                [
                    "Scorch",
                    "Projectile",
                ]
            ),
            new Spell(0, 4, "Fireball", 
                [58, 0, 0],
                10, 150,
                [
                    "Scorch",
                    "Projectile",
                ]
            ),
            new Spell(0, 5, "Fireball", 
                [67, 0, 0],
                10, 150,
                [
                    "Scorch",
                    "Projectile",
                ]
            ),
        ],
        1: [
            new Spell(1, 1, "Spark Bolt", 
                [0, 40, 0],
                10, 150,
                [
                    "Volt",
                    "Projectile",
                ]
            ),
            new Spell(1, 2, "Spark Bolt", 
                [0, 45, 0],
                10, 150,
                [
                    "Volt",
                    "Projectile",
                ]
            ),
            new Spell(1, 3, "Spark Bolt", 
                [0, 51, 0],
                10, 150,
                [
                    "Volt",
                    "Projectile",
                ]
            ),
            new Spell(1, 4, "Spark Bolt", 
                [0, 58, 0],
                10, 150,
                [
                    "Volt",
                    "Projectile",
                ]
            ),
            new Spell(1, 5, "Spark Bolt", 
                [0, 67, 0],
                10, 150,
                [
                    "Volt",
                    "Projectile",
                ]
            ),
        ],
        2: [
            new Spell(2, 1, "Icicle", 
                [0, 0, 40],
                10, 150,
                [
                    "Freeze",
                    "Projectile",
                ]
            ),
            new Spell(2, 2, "Icicle", 
                [0, 0, 45],
                10, 150,
                [
                    "Freeze",
                    "Projectile",
                ]
            ),
            new Spell(2, 3, "Icicle", 
                [0, 0, 51],
                10, 150,
                [
                    "Freeze",
                    "Projectile",
                ]
            ),
            new Spell(2, 4, "Icicle", 
                [0, 0, 58],
                10, 150,
                [
                    "Freeze",
                    "Projectile",
                ]
            ),
            new Spell(2, 5, "Icicle", 
                [0, 0, 67],
                10, 150,
                [
                    "Freeze",
                    "Projectile",
                ]
            ),
        ],
        3: [
            new Spell(3, 1, "Arcane Burst", 
                [20, 20, 20],
                5, 150,
                [
                    "Scorch",
                    "Volt",
                    "Freeze",
                    "Area",
                ]
            ),
            new Spell(3, 2, "Arcane Burst", 
                [21, 21, 21],
                5, 150,
                [
                    "Scorch",
                    "Volt",
                    "Freeze",
                    "Area",
                ]
            ),
            new Spell(3, 3, "Arcane Burst", 
                [22, 22, 22],
                5, 150,
                [
                    "Scorch",
                    "Volt",
                    "Freeze",
                    "Area",
                ]
            ),
            new Spell(3, 4, "Arcane Burst", 
                [23, 23, 23],
                5, 150,
                [
                    "Scorch",
                    "Volt",
                    "Freeze",
                    "Area",
                ]
            ),
            new Spell(3, 5, "Arcane Burst", 
                [24, 24, 24],
                5, 150,
                [
                    "Scorch",
                    "Volt",
                    "Freeze",
                    "Area",
                ]
            ),
        ],
        4: [
            new Spell(4, 1, "Shock Swipe", 
                [0, 30, 0],
                20, 150,
                [
                    "Volt",
                    "Area",
                ]
            ),
            new Spell(4, 2, "Shock Swipe", 
                [0, 33, 0],
                20, 155,
                [
                    "Volt",
                    "Area",
                ]
            ),
            new Spell(4, 3, "Shock Swipe", 
                [0, 36, 0],
                20, 165,
                [
                    "Volt",
                    "Area",
                ]
            ),
            new Spell(4, 4, "Shock Swipe", 
                [0, 39, 0],
                20, 180,
                [
                    "Volt",
                    "Area",
                ]
            ),
            new Spell(4, 5, "Shock Swipe", 
                [0, 42, 0],
                20, 200,
                [
                    "Volt",
                    "Area",
                ]
            ),
        ],
        5: [
            new Spell(5, 1, "Incendiary Thunder", 
                [15, 25, 0],
                15, 150,
                [
                    "Scorch",
                    "Volt",
                    "Area",
                ]
            ),
            new Spell(5, 2, "Incendiary Thunder", 
                [15, 30, 0],
                15, 150,
                [
                    "Scorch",
                    "Volt",
                    "Area",
                ]
            ),
            new Spell(4, 3, "Incendiary Thunder", 
                [20, 30, 0],
                15, 150,
                [
                    "Scorch",
                    "Volt",
                    "Area",
                ]
            ),
            new Spell(5, 4, "Incendiary Thunder", 
                [20, 36, 0],
                15, 150,
                [
                    "Scorch",
                    "Volt",
                    "Area",
                ]
            ),
            new Spell(5, 5, "Incendiary Thunder", 
                [26, 36, 0],
                15, 150,
                [
                    "Scorch",
                    "Volt",
                    "Area",
                ]
            ),
        ],
        6: [
            new Spell(6, 1, "Frost Impact", 
                [0, 0, 50],
                0, 100,
                [
                    "Freeze",
                    "Area",
                ]
            ),
            new Spell(6, 2, "Frost Impact", 
                [0, 0, 58],
                0, 100,
                [
                    "Freeze",
                    "Area",
                ]
            ),
            new Spell(6, 3, "Frost Impact", 
                [0, 0, 70],
                0, 100,
                [
                    "Freeze",
                    "Area",
                ]
            ),
            new Spell(6, 4, "Frost Impact", 
                [0, 0, 86],
                0, 100,
                [
                    "Freeze",
                    "Area",
                ]
            ),
            new Spell(6, 5, "Frost Impact", 
                [0, 0, 106],
                0, 100,
                [
                    "Freeze",
                    "Area",
                ]
            ),
        ],
        7: [
            new Spell(7, 1, "Fusionade", 
                [20, 0, 20],
                8, 150,
                [
                    "Scorch",
                    "Freeze",
                    "Projectile",
                    "Area",
                ]
            ),
            new Spell(7, 2, "Fusionade", 
                [21, 0, 21],
                8, 150,
                [
                    "Scorch",
                    "Freeze",
                    "Projectile",
                    "Area",
                ]
            ),
            new Spell(7, 3, "Fusionade", 
                [23, 0, 23],
                8, 150,
                [
                    "Scorch",
                    "Freeze",
                    "Projectile",
                    "Area",
                ]
            ),
            new Spell(7, 4, "Fusionade", 
                [26, 0, 26],
                8, 150,
                [
                    "Scorch",
                    "Freeze",
                    "Projectile",
                    "Area",
                ]
            ),
            new Spell(7, 5, "Fusionade", 
                [30, 0, 30],
                8, 150,
                [
                    "Scorch",
                    "Freeze",
                    "Projectile",
                    "Area",
                ]
            ),
        ],
        8: [
            new Spell(8, 1, "Spectral Avalanche", 
                [0, 10, 35],
                7, 150,
                [
                    "Volt",
                    "Freeze",
                    "Area",
                ]
            ),
            new Spell(8, 2, "Spectral Avalanche", 
                [0, 10, 40],
                8, 150,
                [
                    "Volt",
                    "Freeze",
                    "Area",
                ]
            ),
            new Spell(8, 3, "Spectral Avalanche", 
                [0, 10, 46],
                9, 150,
                [
                    "Volt",
                    "Freeze",
                    "Area",
                ]
            ),
            new Spell(8, 4, "Spectral Avalanche", 
                [0, 10, 53],
                10, 150,
                [
                    "Volt",
                    "Freeze",
                    "Area",
                ]
            ),
            new Spell(8, 5, "Spectral Avalanche", 
                [0, 10, 61],
                11, 150,
                [
                    "Volt",
                    "Freeze",
                    "Area",
                ]
            ),
        ],
        9: [
            new Spell(9, 1, "Flaming Anvil", 
                [30, 0, 0],
                5, 200,
                [
                    "Scorch",
                    "Projectile",
                ]
            ),
            new Spell(9, 2, "Flaming Anvil", 
                [30, 0, 0],
                5, 250,
                [
                    "Scorch",
                    "Projectile",
                ]
            ),
            new Spell(9, 3, "Flaming Anvil", 
                [30, 0, 0],
                5, 350,
                [
                    "Scorch",
                    "Projectile",
                ]
            ),
            new Spell(9, 4, "Flaming Anvil", 
                [30, 0, 0],
                5, 500,
                [
                    "Scorch",
                    "Projectile",
                ]
            ),
            new Spell(9, 5, "Flaming Anvil", 
                [30, 0, 0],
                5, 700,
                [
                    "Scorch",
                    "Projectile",
                ]
            ),
        ],
    };

    // List of droppable tiered spells
    static spellTiers = [
        1,
        2,
        3
    ]

    // Corresponding weights for spell tiering
    static spellTierWeights = [
        90,
        9,
        1
    ]

    // Get one of the first 3 spells in spell list for
    // wizard initialization
    static getStartingSpell() {
        let spell =  this.spellList[Math.floor(Math.random() * 3)][0];

        return Spell.copySpell(spell);
    }

    // Get random spell (weighted for tiers)
    static getRandomSpell(blacklist = []) {
        let validSpellIDs = [];
        let blacklistFiltered = blacklist.filter(spell => spell != null);

        // Loop through spell list and get valid spell IDs
        for (let i = 0; i < Object.keys(this.spellList).length; i++) {
            let found = false;

            blacklistFiltered.forEach((spell) => {
                if (spell.spellID === i) {
                    found = true;
                }
            });

            if (found === false) {
                validSpellIDs.push(i);
            }
        }

        let randomIndex = Math.floor(Math.random() * validSpellIDs.length);
        let randomSpellID = validSpellIDs[randomIndex];
        let randomTier = weightedChoice(this.spellTiers, this.spellTierWeights) - 1; // Convert to zero based

        return Spell.copySpell(this.spellList[randomSpellID][randomTier]);
    }

    // Returns string of spells for display purposes
    static convertSpellListToString(spellList) {
        let string = "";
        let spellListTemp = spellList.filter(spell => spell != null);

        for (let i = 0; i < spellListTemp.length; i++) {
            string += spellListTemp[i].spellName;

            if (i != spellListTemp.length - 1 && spellListTemp.length != 1) {
                string += ", ";
            }
        }
        
        return string;
    }

    // Returns a spell's description for display purposes
    static getSpellDescription(spell) {
        let string = '[MISSING DESCRIPTION]'

        switch (spell.spellID) {
            // Fireball
            case 0:
                string = 'Blast a concentrated ball of fire';
                break;
            // Spark Bolt
            case 1:
                string = 'Fling an electrocuting bolt of energy';
                break;
            // Icicle
            case 2:
                string = 'Conjure a fast moving icicle';
                break;
            // Arcane Burst
            case 3:
                string = "Channel all your elemental energy into one single outburst";
                break;
            // Shock Swipe
            case 4:
                string = "Electrify a swift blade of energy";
                break;
            // Incendiary Thunder
            case 5:
                string = "Call forth storms that scorch the ground";
                break;
            // Frost Impact
            case 6:
                string = "Conjure a large slab of ice to crush an enemy";
                break;
            // Fusionade
            case 7:
                string = "Infuse scorch and freeze together to make an improvised explosive";
                break;
            // Spectral Avalanche
            case 8:
                string = "Spread volt particles through a blizzard of snow, creating a deadly avalanche";
                break;
            // Flaming Anvil
            case 9:
                string = "Drop a anvil that spontenously combusts on an enemy";
                break;
            default:
                break;
        }

        return string;
    }
}