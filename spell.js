import { SpellDB } from "./spellDB.js";
import { 
    MessageComponentTypes
 } from "discord-interactions";

export class Spell {
    constructor(spellID, spellName, baseDamage, tags) {
        this.spellID = spellID;
        this.spellName = spellName;
        this.baseDamage = baseDamage;
        this.tags = tags;
    }

    getName() {
        return this.spellName;
    }

    getDamage() {
        return this.baseDamage;
    }

    getDamageString() {
        return `🔥 ${this.baseDamage[0]} | ⚡ ${this.baseDamage[1]} | ❄️ ${this.baseDamage[2]}`;
    }

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

    toJSON() {
        return {
            _id: this.spellID,
            spell_name: this.spellName,
            base_damage: this.baseDamage,
            tags: this.tags,
        }
    }

    toComponent() {
        return [
            {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `### ${this.spellName}`,
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
                content: SpellDB.getSpellDescription(this),
            },
        ]
    }
}