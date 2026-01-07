import { Spell } from './spell.js';
import {
  ButtonStyleTypes,
  MessageComponentTypes,
} from 'discord-interactions';

// Base damage is [SCORCH, VOLT, FREEZE]
export class SpellDB {
    static spellList = [
        new Spell(0, "Fireball", [40, 0, 0],
            [
                "Scorch",
                "Projectile",
            ]
        ),
        new Spell(1, "Spark Bolt", [0, 40, 0],
            [
                "Volt",
                "Projectile",
            ]
        ),
        new Spell(2, "Icicle", [0, 0, 40],
            [
                "Freeze",
                "Projectile",
            ]
        ),
    ];

    static getStartingSpell() {
        return this.spellList[Math.floor(Math.random() * 3)];
    }

    static getRandomSpell(blacklist) {
        let validSpells = [];
        let blacklistFiltered = blacklist.filter(spell => spell != null);

        for (let i = 0; i < this.spellList.length; i++) {
            let found = false;

            blacklistFiltered.forEach((spell) => {
                if (spell.spellID === this.spellList[i].spellID) {
                    found = true;
                }
            });

            if (found === false) {
                validSpells.push(this.spellList[i]);
            }
        }

        let randomIndex = Math.floor(Math.random() * validSpells.length);

        return validSpells[randomIndex];
    }

    static convertSpellListToString(spellList) {
        let string = "";
        let spellListTemp = spellList.filter(spell => spell != null);

        for (let i = 0; i < spellListTemp.length; i++) {
            string += spellListTemp[i].getName();

            if (i != spellListTemp.length - 1 && spellListTemp.length != 1) {
                string += ", ";
            }
        }
        
        return string;
    }

    static getSpellDescription(spell) {
        let string = '[MISSING DESCRIPTION]'

        switch (spell.spellID) {
            case 0:
                string = 'Blast a concentrated ball of fire'
                break;
            case 1:
                string = 'Fling an electrocuting bolt of energy'
                break;
            default:
                string = 'Conjure a fast moving icicle'
                break;
        }

        return string;
    }
}