import { MessageComponentTypes } from "discord-interactions";
import { MoveDB } from "./moveDB.js";

export class Move {
    constructor(moveID, moveName, manaCost, damage, critChance, statuses) {
        this.moveID = moveID,
        this.moveName = moveName,
        this.manaCost = manaCost,
        this.damage = damage,
        this.critChance = critChance,
        this.statuses = statuses
    }

    static copyMove(move) {
        let moveTemp = new Move(move.moveID, 
                                move.moveName,
                                move.manaCost,
                                move.damage,
                                move.critChance,
                                move.statuses);

        return moveTemp;
    }

    // Returns string representing the damage that this spell does
    getDamageString() {
        return `🔥 ${this.damage[0]} | ⚡ ${this.damage[1]} | ❄️ ${this.damage[2]}`;
    }

    toString() {
        return `[${this.manaCost} 🔹] ${this.moveName} - ${this.getDamageString()}`;
    }

    toJSON() {
        return {
            moveID: this.moveID,
            moveName: this.moveName
        }
    }

    static fromJSON(doc) {
        return this.copyMove(MoveDB.moveList[doc.moveID]);
    }
}