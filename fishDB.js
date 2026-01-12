import { weightedChoice } from "./chance.js"
import { Fish } from "./fish.js"

export class FishDB {
    static commonFishList = [
        new Fish(0, "Guppy", "Common", 
            [0.01, 0.03],
        ),
        new Fish(1, "Common Goldfish", "Common", 
            [0.01, 0.04],
        ),
        new Fish(2, "Rainbow Sardine", "Common", 
            [0.01, 0.03],
        ),
        new Fish(3, "Neon Tetra", "Common", 
            [0.01, 0.02],
        ),
        new Fish(4, "Wood Frog Tadpole", "Common", 
            [0.01, 0.02],
        ),
    ]

    static rareFishList = [
        new Fish(0, "Brook Trout", "Rare", 
            [2.3, 9.7],
        ),
        new Fish(1, "Flathead Catfish", "Rare",
            [8, 20],
        ),
        new Fish(2, "Reef Lobster", "Rare",
            [0.15, 0.3],
        ),
        new Fish(3, "Largemouth Bass", "Rare",
            [1, 22],
        ),
        new Fish(4, "Giant Tiger Prawn", "Rare",
            [0.3, 0.9],
        ),
    ]

    static epicFishList = [
        new Fish(0, "Lionfish", "Epic",
            [1, 3],
        ),
        new Fish(1, "Blue Ring Octopus", "Epic",
            [0.2, 0.4],
        ),
        new Fish(2, "Yellowtail Barracuda", "Epic",
            [0.9, 2.5],
        ),
        new Fish(3, "Blacktip Shark", "Epic",
            [20, 250],
        ),
        new Fish(4, "Cuttlefish", "Epic",
            [5, 9],
        ),
    ]

    static legendaryFishList = [
        new Fish(0, "Arcane Squid", "Legendary",
            [500, 1000],
        ),
        new Fish(1, "Phoenix Betta", "Legendary",
            [0.1, 0.25]
        ),
        new Fish(2, "Stonefish of Earthquaking", "Legendary",
            [10, 20],
        ),
        new Fish(3, "Arrowhead Arapaima", "Legendary",
            [200, 440],
        ),
        new Fish(4, "Voltbox Jellyfish", "Legendary",
            [4, 6],
        ),
    ]

    static fishListList = [
        this.commonFishList,
        this.rareFishList,
        this.epicFishList,
        this.legendaryFishList,
    ]

    static fishListDict = {
        "Common": this.commonFishList,
        "Rare": this.rareFishList,
        "Epic": this.epicFishList,
        "Legendary": this.legendaryFishList,
    }

    static fishRarityWeights = [
        800,
        100,
        15,
        2,
    ]

    // Get a random fish, weighted with rarity
    static getRandomFish() {
        let list = weightedChoice(this.fishListList, this.fishRarityWeights);

        let randomIndex = Math.floor(Math.random() * list.length);

        return Fish.copyFish(list[randomIndex]);
    }
}