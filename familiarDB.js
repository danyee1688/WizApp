import { weightedChoice } from "./chance.js";
import { Familiar } from "./familiar.js";
import { MoveDB } from "./moveDB.js";

export class FamiliarDB {
    static familiarList = [];

    static setup() {
        this.familiarList = [
            new Familiar(0, "Shroomling", ["Ordinary"], 10, 2, 50, 4),
            new Familiar(1, "Scorchling", ["Scorch"], 10, 3, 50, 4),
            new Familiar(2, "Boggol", ["Ordinary"], 10, 3, 50, 3),
            new Familiar(3, "Boltfrog", ["Volt"], 9, 3, 52, 6),
            new Familiar(4, "Thornnull", ["Freeze"], 10, 3, 50, 4),
            new Familiar(5, "Snowbull", ["Freeze"], 15, 3, 45, 5),
            new Familiar(6, "Crystaur", ["Freeze"], 10, 3, 50, 4),
            new Familiar(7, "Yux", ["Volt"], 10, 3, 50, 3),
            new Familiar(8, "Volcane", ["Scorch"], 8, 3, 60, 5),
            new Familiar(9, "Ghouster", ["Ordinary"], 10, 3, 50, 3),
        ]
    }

    static familiarMoveSets = {
        "Shroomling": [
            MoveDB.moveList[0],
        ],
        "Scorchling": [
            MoveDB.moveList[0],
        ],
        "Boggol": [
            MoveDB.moveList[2],
        ],
        "Boltfrog": [
            MoveDB.moveList[1],
        ],
        "Thornnull": [
            MoveDB.moveList[1],
        ],
        "Snowbull": [
            MoveDB.moveList[2],
        ],
        "Crystaur": [
            MoveDB.moveList[2],
        ],
        "Yux": [
            MoveDB.moveList[2],
        ],
        "Volcane": [
            MoveDB.moveList[0],
        ],
        "Ghouster": [
            MoveDB.moveList[1],
        ],
    }

    static familiarWeights = [
        10,
        10,
        10,
        10,
        10,
        10,
        10,
        5,
        8,
        8,
    ]

    static tierRanges = [
        [1, 5],
        [6, 11],
        [12, 17],
        [18, 25],
    ]

    static tierWeights = [
        20,
        15,
        15,
        10,
    ]

    static descriptions = {
        "Shroomling": "Shaped like a small mushroom, Shroomlings often "
                    + "disguise themselves next to fallen trees. They "
                    + "release spores when frightened in an attempt to "
                    + "escape.",
        "Scorchling": "Small but fiery, a Scorchling has a spontaneous "
                    + "personality. They often take pieces of coal and use "
                    + "them as pillows of warmth.",
        "Boggol": "Boggols travel in packs, rolling around in swamps and "
                    + "mud. You can usually find them flinging mud at each "
                    + "other during the Summer. The mud keeps their legs cool "
                    + "while also polishing their scales.",
        "Boltfrog": "Leaping up to 100 feet into the air, a Boltfrog posses "
                    + "extraordinary movement abilities. However, if left "
                    + "uncharged for too long, it will no longer be able to jump.",
        "Thornull": "A Thornull is extremely territorial. Take caution when "
                    + "approaching these spiny creatures as they are willing to "
                    + "protect their eggs at all cost. They also smell like "
                    + "burnt toast.",
        "Snowbull": "Snowbulls tread through snow very easily, making them "
                    + "ideal mounts for traveling through snowy wastelands. "
                    + "However, they also seem to be easily angered by any "
                    + "red object.",
        "Crystaur": "A bed of icicles is one of Crystaur's main habitats. It "
                    + "uses the icicles to scratch their tail. The icicles "
                    + "can also used as replacements for the ones on their "
                    + "back.",
        "Yux": "Seemingly eerie, a Yux is actually very friendly when approached. "
                    + "They are known to aid travellers to nearby sources of "
                    + "water if they seem to be thirsty.",
        "Volcane": "Oftentimes combusting sponteously, a Volcane cannot be "
                    + "trusted around wooden structures. However, wizards can "
                    + "utilize their combustion for specially created stoves.",
        "Ghouster": "Ghousters often haunt the memories of those in peril. They "
                    + "are incredibly loud when encountered in person. "
                    + "They are very fond of ancient trinkets."
    }
    
    static getRandomFamiliar() {
        let familiar = Familiar.copyFamiliar(weightedChoice(this.familiarList, this.familiarWeights));

        familiar.getRandomMoveSet();
        familiar.setup();

        return familiar;
    }

    // Player gets to choose from the following
    // Scorchling
    // Boltfrog
    // Crystaur
    static getStartingFamiliars() {
        // Scorchling
        let familiar1 = Familiar.copyFamiliar(this.familiarList[1]);
        familiar1.tier = 5;
        familiar1.getBaseStats();
        familiar1.moveSet.push(MoveDB.moveList[0]);

        console.log(`static list moveset should be empty:`);
        console.log(this.familiarList[1].moveSet);

        // Boltfrog
        let familiar2 = Familiar.copyFamiliar(this.familiarList[3]);
        familiar2.tier = 5;
        familiar2.getBaseStats();
        familiar2.moveSet.push(MoveDB.moveList[1]);

        // Crystaur
        let familiar3 = Familiar.copyFamiliar(this.familiarList[6]);
        familiar3.tier = 5;
        familiar3.getBaseStats();
        familiar3.moveSet.push(MoveDB.moveList[2]);

        return [familiar1, familiar2, familiar3];
    }

    static getElementEmoji(elements) {
        let retVal = '';

        for (let i = 0; i < elements.length; i++) {
            switch (elements[i]) {
                case "Ordinary":
                    retVal += "⚪";
                    break;
                case "Scorch":
                    retVal += "🔥";
                    break;
                case "Volt":
                    retVal += "⚡";
                    break;
                case "Freeze":
                    retVal += "❄️";
                    break;
            }
        }
        
        return retVal;
    }
}