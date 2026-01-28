import { Move } from "./move.js";
import { StatusDB } from "./statusDB.js";

export class MoveDB {
    static moveList = [
        new Move(0, "Fireball", 1, [20, 0, 0], 5, []),
        new Move(1, "Spark Bolt", 1, [0, 20, 0], 5, []),
        new Move(2, "Icicle", 1, [0, 0, 20], 5, []),
        new Move(3, "Engulf", 2, [15, 0, 0], 5, 
        [
            {
                target: "Enemy",
                chance: 33,
                status: StatusDB.statusList[0],
                value: 3,
                duration: 3,
            },
        ]),
    ]

    static moveDescriptions = {
        "Fireball": "Fire a massive ball of fire.",
        "Spark Bolt": "Fire a surging bolt of electricity.",
        "Icicle": "Fire a packed shard of ice.",
        "Engulf": "Surround an enemy in flames. Has a 33% chance to apply Ignited",
    }
}