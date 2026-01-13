import { SpellDB } from "./spellDB.js";
import { 
    MessageComponentTypes
 } from "discord-interactions";

export class Spell {
    constructor(spellID, tier, spellName, baseDamage, critChance, critDamage, tags) {
        this.spellID = spellID;
        this.tier = tier;
        this.spellName = spellName;
        this.baseDamage = baseDamage;
        this.critChance = critChance;
        this.critDamage = critDamage;
        this.tags = tags;
    }

    // Returns string representing the damage that this spell does
    getDamageString() {
        return `🔥 ${this.baseDamage[0]} | ⚡ ${this.baseDamage[1]} | ❄️ ${this.baseDamage[2]}`;
    }

    // Returns string for all tags this spell has for display
    // purposes
    getTagsString() {
        let retVal = '-# ';

        if (this.tags.length == 1) {
            retVal += this.tags[0];
        }
        else {
            for (let i = 0; i < this.tags.length; i++) {
                if (i != this.tags.length - 1) {
                    retVal += this.tags[i] + ', ';
                }
                else {
                    retVal += this.tags[i];
                }
            }
        }

        return retVal;
    }

    // Returns string based on spell tier for display purposes
    getTierString() {
        let retVal = 'Tier ';

        switch (this.tier) {
            case 1:
                retVal += 'I';
                break;
            case 2:
                retVal += 'II';
                break;
            case 3:
                retVal += 'III';
                break;
            case 4:
                retVal += 'IV';
                break;
            case 5:
                retVal += 'V';
                break;
            default:
                break;
        }

        return retVal;
    }

    // Convert object to JSON
    toJSON() {
        return {
            _id: this.spellID,
            spell_name: this.spellName,
            tier: this.tier,
            crit_chance: this.critChance,
            crit_damage: this.critDamage,
            base_damage: this.baseDamage,
            tags: this.tags,
        }
    }

    // Convert object to component for discord messages
    toComponent() {
        return [
            {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `### ${this.spellName} ${this.getTierString()}`,
            },
            {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: this.getTagsString(),
            },
            {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: this.getDamageString(),
            },
            {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `CC: ${this.critChance}% | CD: ${this.critDamage}%`,
            },
            {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: SpellDB.getSpellDescription(this),
            },
        ]
    }
}