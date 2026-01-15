import { SpellDB } from "./spellDB.js";
import { 
    MessageComponentTypes
 } from "discord-interactions";

export class Spell {
    constructor(spellID, tier, spellName, baseDamage, critChance, critDamage, tags) {
        this.internalType = "spell",
        this.spellID = spellID;
        this.tier = tier;
        this.effectiveTier = tier;
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

    // Returns Spell object
    // Prevents changing persistent objects
    static copySpell(spell) {
        let spellTemp = new Spell(spell.spellID, spell.tier, spell.spellName, spell.baseDamage, spell.critChance, spell.critDamage, spell.tags);

        return spellTemp;
    }

    // Have this spell copy data, effectively
    // turning into a specified spell
    copySpellLocal(spell) {
        this.spellID = spell.spellID;
        this.spellName = spell.spellName;
        this.baseDamage = spell.baseDamage;
        this.critChance = spell.critChance;
        this.critDamage = spell.critDamage;
        this.tags = spell.tags;
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

        switch (this.effectiveTier) {
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

    // Cap effective tier at 5
    // Also set spell's stats if necessary
    setEffectiveTier(tier) {
        if (tier > 5) {
            this.effectiveTier = 5;
        }
        else {
            this.effectiveTier = tier;
        }

        if (this.effectiveTier !== this.tier) {
            let tieredSpell = SpellDB.spellList[this.spellID][this.effectiveTier - 1];

            this.copySpellLocal(tieredSpell);
        }
    }

    // Convert object to JSON
    toJSON() {
        let baseSpell = SpellDB.spellList[this.spellID][this.tier - 1];

        return {
            _id: baseSpell.spellID,
            spell_name: baseSpell.spellName,
            tier: baseSpell.tier,
            crit_chance: baseSpell.critChance,
            crit_damage: baseSpell.critDamage,
            base_damage: baseSpell.baseDamage,
            tags: baseSpell.tags,
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

    // Returns boolean 
    // Whether or not spell has tag
    hasTag(tag) {
        if (this.tags.includes(tag)) {
            return true;
        }
        else {
            return false;
        }
    }
}