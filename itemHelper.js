import { Item } from './item.js';
import { weightedChoice } from './chance.js';

export class ItemHelper {
    static numRolls = {
        0: [1, 3],
        1: [1, 4],
        2: [2, 5],
        3: [3, 5],
    }

    // Get number of rolls an item will have based on rarity
    static getNumRolls(itemRarity) {
        let min = this.numRolls[itemRarity][0];
        let max = this.numRolls[itemRarity][1];

        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static itemRarities = [
        0,
        1,
        2,
        3
    ]

    static itemRarityWeights = [
        75,
        20,
        4,
        1
    ]

    // Get random rarity, weighted
    static getRandomRarity() {
        return weightedChoice(this.itemRarities, this.itemRarityWeights);
    }

    static itemBases = [
        0,
        1,
        2,
        3
    ]

    // Get random item base, unweighted
    static getRandomBase() {
        let randomIndex = Math.floor(Math.random() * this.itemBases.length);

        return this.itemBases[randomIndex];
    }

    static itemBaseNames = {
        0: [
            "Rod",
            "Cane",
            "Branch",
            "Pole",
        ],
        1: [
            "Necklace",
            "Pendant",
            "Charm",
            "Talisman",
        ],
        2: [
            "Banglet",
            "Band",
            "Loop"
        ],
        3: [
            "Girdle",
            "Sash",
            "Strap",
        ]
    }

    // Generate item name by base type and stats
    static generateName(type, stats) {
        let resultantName = '';
        let itemBaseNames = this.itemBaseNames[type];
        let randomIndex = Math.floor(Math.random() * itemBaseNames.length);
        let itemBaseName = itemBaseNames[randomIndex];

        // If item has one stat, just use that stat's name as a prefix
        // Otherwise, use the first two stat's names as prefixes
        if (stats.length > 1) {
            resultantName += stats[0].statName + ' ' + stats[1].statName + ' ' + itemBaseName
        }
        else {
            resultantName += stats[0].statName + ' ' + itemBaseName;
        }

        return resultantName;
    }
}