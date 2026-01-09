import { ItemHelper } from "./itemHelper.js";
import { StatDB } from "./statDB.js";
import { Stat } from "./stat.js";
import { 
    MessageComponentTypes,
    InteractionResponseType
} from "discord-interactions";

export class Item {
    static ITEM_TYPE = {
        Staff: 0,
        Amulet: 1,
        Ring: 2,
        Belt: 3,
    }

    static ITEM_RARITY = {
        Common: 0,
        Rare: 1,
        Epic: 2,
        Legendary: 3,
    }

    constructor() {
        this.itemType = ItemHelper.getRandomBase();
        this.itemRarity = ItemHelper.getRandomRarity();
        this.stats = this.rollStats();
        this.itemName = ItemHelper.generateName(this.itemType, this.stats);
    }

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

    rollStats() {
        let numStats = ItemHelper.getNumRolls(this.itemRarity);

        let stats = [];

        for (let i = 0; i < numStats; i++) {
            let stat = StatDB.getRandomStat(stats, this.itemType, this.itemRarity);

            if (stat != null) {
                stats.push(stat);
            }
        }

        console.log(stats);

        return stats;
    }

    statsToString() {
        let retVal = "";

        for (let i = 0; i < this.stats.length; i++) {
            retVal += this.stats[i].getParsedDescription() + "\n";
        }

        return retVal;
    }

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

    toJSON() {
        return {
            itemName: this.itemName,
            itemType: this.itemType,
            itemRarity: this.itemRarity,
            stats: this.stats.map(stat => stat.toJSON()),
        };
    }

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