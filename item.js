import { ItemHelper } from "./itemHelper.js";
import { StatDB } from "./statDB.js";
import { Stat } from "./stat.js";
import { 
    MessageComponentTypes,
    InteractionResponseType
} from "discord-interactions";
import { randomUUID } from "crypto";

export class Item {
    // Enum for type
    static ITEM_TYPE = {
        Staff: 0,
        Amulet: 1,
        Ring: 2,
        Belt: 3,
    }

    // Enum for rarity
    static ITEM_RARITY = {
        Common: 0,
        Rare: 1,
        Epic: 2,
        Legendary: 3,
    }

    constructor() {
        this.internalType = "item",
        this.internalID = randomUUID();
        this.itemType = ItemHelper.getRandomBase();
        this.itemRarity = ItemHelper.getRandomRarity();
        this.stats = this.rollStats();
        this.itemName = ItemHelper.generateName(this.itemType, this.stats);
    }

    // Returns string for display
    typeToString() {
        switch (this.itemType) {
            case 0:
                return "Staff";
            case 1:
                return "Amulet";
            case 2:
                return "Ring";
            case 3:
                return "Belt";
        }
    }

    // Returns string for display
    rarityToString() {
        switch (this.itemRarity) {
            case 0:
                return "Common";
            case 1:
                return "Rare";
            case 2:
                return "Epic";
            case 3:
                return "Legendary";
        }
    }

    // Return color for containers or other use
    rarityToColor() {
        switch (this.itemRarity) {
            case 0:
                return 0x808080;
            case 1:
                return 0x0000FF;
            case 2:
                return 0xFF00FF;
            case 3:
                return 0xFF7F00;
        }
    }

    // Roll stats for item
    rollStats() {
        let numStats = ItemHelper.getNumRolls(this.itemRarity);

        let stats = [];

        // Grab random stat from DB if allowed
        for (let i = 0; i < numStats; i++) {
            let stat = StatDB.getRandomStat(stats, this.itemType, this.itemRarity);

            if (stat != null) {
                stats.push(stat);
            }
        }

        return stats;
    }

    // Returns item's stats as a string for display
    statsToString() {
        let retVal = "";

        for (let i = 0; i < this.stats.length; i++) {
            retVal += this.stats[i].getParsedDescription() + "\n";
        }

        return retVal;
    }

    // Converts object to component for discord messages
    toComponent() {
        return [
            {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `### ${this.itemName}`,
            },
            {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `### ${this.rarityToString()} ${this.typeToString()}`,
            },
            {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `${this.statsToString()}`,
            },
        ]
    }

    // Convert object to JSON
    toJSON() {
        return {
            itemName: this.itemName,
            itemType: this.itemType,
            itemRarity: this.itemRarity,
            stats: this.stats.map(stat => stat.toJSON()),
        };
    }

    // Convert JSON to object
    static fromJSON(data) {
        let item = new Item(data.itemType, data.itemRarity);
        item.itemType = data.itemType;
        item.itemRarity = data.itemRarity;
        item.stats = [];
        item.stats = data.stats.map(statData => Stat.fromJSON(statData));
        item.itemName = data.itemName;

        return item;
    }
}