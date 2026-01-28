import { MessageComponentTypes } from "discord-interactions";
import { chance, weightedChoice } from "./chance.js";
import { FamiliarDB } from "./familiarDB.js"
import { Move } from "./move.js";
import { MoveDB } from "./moveDB.js";

// Familiar typing rules
// Ordinary - Not weak or strong against anything
// Scorch - weak against scorch, strong against freeze
// Volt - weak against volt, strong against scorch
// Freeze - weak against freeze, strong against volt
export class Familiar {
    constructor(familiarID, familiarName, elements, baseHealth, baseMana, baseDamageEffectiveness, baseSpeed) {
        this.familiarID = familiarID,
        this.familiarName = familiarName,
        this.moveSet = [],
        this.elements = elements,
        this.tier = 0
        this.baseDamageEffectiveness = baseDamageEffectiveness,
        this.damageEffectiveness = 0;
        this.baseHealth = baseHealth,
        this.maxHealth = 0,
        this.health = 0,
        this.baseMana = baseMana
        this.maxMana = 0,
        this.mana = 0,
        this.baseSpeed = baseSpeed;
        this.speed = 0;
        this.stats = {
            increasedCritChance: 0,
            increasedScorchDamage: 0,
            increasedVoltDamage: 0,
            increasedFreezeDamage: 0,
            ignited: false,
            shocked: false,
            frozen: false,
        }
    }

    setup() {
        this.getTier();
        this.getBaseStats();
    }

    static copyFamiliar(familiar) {
        let familiarTemp = new Familiar(familiar.familiarID, 
                                        familiar.familiarName,
                                        familiar.elements,
                                        familiar.baseHealth,
                                        familiar.baseMana,
                                        familiar.baseDamageEffectiveness);

        familiarTemp.moveSet = [...familiar.moveSet];
        familiarTemp.tier = familiar.tier;
        familiarTemp.maxHealth = familiar.maxHealth;
        familiarTemp.health = familiar.health;
        familiarTemp.maxMana = familiar.maxMana;
        familiarTemp.mana = familiar.mana;
        familiarTemp.stats = {...familiar.stats};

        return familiarTemp;
    }

    getRandomMoveSet() {
        let possibleMoveSet = FamiliarDB.familiarMoveSets[this.familiarName];
        let returnedMoveSet = [];
        
        // Get random number of moves from 2 - 4 range (inclusive)
        let minMoves = 2;
        let maxMoves = 4;
        let numMoves = Math.floor(Math.random() * (maxMoves - minMoves + 1)) + minMoves;
        
        for (let i = 0; i < numMoves; i++) {
            if (possibleMoveSet.length > 0) {
                // Get random move from possible move set
                let randomIndex = Math.floor(Math.random() * possibleMoveSet.length);
                let randomMove = possibleMoveSet[randomIndex];

                // Remove respective move from possible move set
                possibleMoveSet.splice(randomIndex, 1);

                // Add respective move to return array
                returnedMoveSet.push(randomMove);
            }
            else {
                break;
            }
        }

        this.moveSet = returnedMoveSet;
    }

    // Set familiars moveset corresponding to a list of integers
    setMoveSet(list) {
        list.forEach((moveID) => {
            this.moveSet.push(MoveDB.moveList[moveID]);
        });
    }

    getBaseStats() {
        // Health is increased by 3 every tier
        this.maxHealth = this.baseHealth + (this.tier * 3)

        // Mana is increased by 1 every 10 tiers
        this.maxMana = this.baseMana + Math.floor(this.tier / 10);

        // Base damage effectiveness is increased by 2.5 every tier
        this.damageEffectiveness = this.baseDamageEffectiveness + Math.floor(this.tier * 2.5)

        // speed is increased by 1 every 5 tiers
        this.speed = this.baseSpeed + Math.floor(this.tier / 5);

        this.health = this.maxHealth;
        this.mana = this.maxMana;
    }

    getTier() {
        let range = weightedChoice(FamiliarDB.tierRanges, FamiliarDB.tierWeights);
        let min = range[0];
        let max = range[1];
        this.tier = Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getMovesToString() {
        let retString = "";

        for (let i = 0; i < this.moveSet.length; i++) {
            retString += this.moveSet[i].moveID;

            if (i !== this.moveSet.length - 1) {
                retString += "-";
            }
        }
        console.log("moves to string: ", retString);
        return retString;
    }


    getElementsToString() {
        let retVal = '';

        for (let i = 0; i < this.elements.length; i++) {
            if (i !== this.elements.length - 1) {
                retVal += `${this.elements[i]}, `;
            }
            else {
                retVal += `${this.elements[i]}`;
            }
        }

        return retVal;
    }

    getHealthBar() {
        let fraction = (this.health / this.maxHealth) * 10;
        let healthBar = "[";

        for (let i = 0; i <= 10; i++) {
            if (i <= fraction) {
                healthBar += 'II';
            }
            else {
                healthBar += ' ';
            }
        }

        healthBar += `] ${this.health}/${this.maxHealth}`;

        return healthBar;
    }

    useRandomMove(target) {
        let randomIndex = Math.floor(Math.random() * this.moveSet.length);

        let move = this.moveSet[randomIndex];

        let [scorchDam, voltDam, freezeDam] = move.damage;
        
        scorchDam = Math.round(scorchDam * (this.damageEffectiveness / 100));
        voltDam = Math.round(voltDam * (this.damageEffectiveness / 100));
        freezeDam = Math.round(freezeDam * (this.damageEffectiveness / 100));

        console.log(target.takeDamage([scorchDam, voltDam, freezeDam], move.critChance));
    }

    useMove(moveIndex, target) {
        let move = this.moveSet[moveIndex];

        let [scorchDam, voltDam, freezeDam] = move.damage;
        
        scorchDam = Math.round(scorchDam * (this.damageEffectiveness / 100));
        voltDam = Math.round(voltDam * (this.damageEffectiveness / 100));
        freezeDam = Math.round(freezeDam * (this.damageEffectiveness / 100));

        console.log(target.takeDamage([scorchDam, voltDam, freezeDam], move.critChance));
    }

    takeDamage(damage, critChance) {
        let [scorchDam, voltDam, freezeDam] = damage;

        let scorchDamMulti = 1;
        let voltDamMulti = 1;
        let freezeDamMulti = 1;
        let crit = false;
        let critMulti = 1;
        let totalDamageTaken = 0;

        if (this.elements.includes("Scorch")) {
            scorchDamMulti -= 0.5;
            voltDamMulti += 0.5;
        }

        if (this.elements.includes("Volt")) {
            voltDamMulti -= 0.5;
            freezeDamMulti += 0.5;
        }

        if (this.elements.includes("Freeze")) {
            freezeDamMulti -= 0.5;
            scorchDamMulti += 0.5;
        }

        if (chance(critChance) === true) {
            critMulti += 0.5;
            crit = true;
        }

        let totalMultiplier = 0;

        if (scorchDam !== 0) {
            totalMultiplier += scorchDamMulti - 1;
        }

        if (voltDam !== 0) {
            totalMultiplier += voltDamMulti - 1;
        }

        if (freezeDam !== 0) {
            totalMultiplier += freezeDamMulti - 1;
        }

        totalDamageTaken = Math.round(((scorchDam * scorchDamMulti) + (voltDam * voltDamMulti) + (freezeDam * freezeDamMulti)) * critMulti);

        this.health -= totalDamageTaken;

        // Return string for visual confirmation
        let stringified = `${this.familiarName} took ${totalDamageTaken} damage! `;

        // Concatenate strings that are relevant to what happened
        if (crit === true) {
            stringified += `It was a critical hit! `
        }

        if (totalMultiplier > 0) {
            stringified += `It was elementally potent!`
        }
        else if (totalMultiplier < 0) {
            stringified += `It was elementally weak...`
        }

        return stringified;
    }

    toComponent() {
        let moveString = "";

        for (let i = 0; i < this.moveSet.length; i++) {
            moveString += this.moveSet[i].toString();

            if (i !== this.moveSet.length - 1) {
                moveString +='\n';
            }
        }

        let moveSetComponent = [
            {
                type: MessageComponentTypes.SEPARATOR,
                spacing: 1.5,
            },
            {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `Moves:`
            },
            {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: moveString
            }
        ]

        let descriptionComponent = [
            {
                type: MessageComponentTypes.SEPARATOR,
                spacing: 1.5,
            },
            {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `-# ${FamiliarDB.descriptions[this.familiarName]}`
            }
        ]

        return [
            {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `## ${FamiliarDB.getElementEmoji(this.getElementsToString())} ${this.familiarName}`
            },
            {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `### Tier ${this.tier}`
            },
            {
                type: MessageComponentTypes.SEPARATOR,
                spacing: 1.5
            },
            {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `- Health: ${this.health}`
            },
            {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `- Mana: ${this.mana}`
            },
        ].concat(moveSetComponent).concat(descriptionComponent);
    }

    toBattleComponent() {
        return [
            {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `### ${this.familiarName} Tier ${this.tier}`
            },
            {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `-# ${this.getElementsToString()}`
            },
            {
                type: MessageComponentTypes.SEPARATOR,
                spacing: 1.5
            },
            {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `${this.getHealthBar()}`
            },
        ]
    }

    toJSON() {
        let data = {
            familiarID: this.familiarID,
            familiarName: this.familiarName,
            moveSet: this.moveSet.map(move => move ? move.toJSON() : null),
            tier: this.tier,
        }

        return data;
    }

    static fromJSON(doc) {
        if (doc) {
            let familiar = this.copyFamiliar(FamiliarDB.familiarList[doc.familiarID]);

            familiar.moveSet = doc.moveSet.map(move => move ? Move.fromJSON(move) : null);
            familiar.tier = doc.tier;
            familiar.getBaseStats();

            return familiar;
        }
        else {
            return null;
        }
    }
}