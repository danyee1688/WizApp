export class Fish {
    constructor(fishID, fishName, fishRarity, weightRolls) {
        this.fishID = fishID,
        this.fishName = fishName,
        this.fishRarity = fishRarity,
        this.weightRolls = weightRolls,
        this.weight = this.rollWeight(weightRolls),
        this.value = this.getValue();
    }

    rollWeight(weightRolls) {
        let min = weightRolls[0];
        let max = weightRolls[1];

        let value = (Math.random() * (max - min)) + min;
        value *= 1000;
        value = Math.floor(value);
        value /= 1000;

        return value;
    }

    static copyFish(fish) {
        return new Fish(fish.fishID, fish.fishName, fish.fishRarity, fish.weightRolls);
    }

    getValue() {
        let fishRarityMultiplier = 1;
        let fishWeightMultiplier = (this.weight / this.weightRolls[1]) ** 2;
        let baseValue = Math.floor(Math.random() * 100) + 50;

        switch (this.fishRarity) {
            case "Common":
                fishRarityMultiplier = 1;
                break;
            case "Rare":
                fishRarityMultiplier = 2;
                break;
            case "Epic":
                fishRarityMultiplier = 5;
                break;
            case "Legendary":
                fishRarityMultiplier = 20;
                break;
            default:
                break;
        }

        return Math.floor(baseValue * (fishRarityMultiplier + fishWeightMultiplier));
    }

    getShortenedDetails() {
        return `${this.fishName} [${this.weight} lbs (${this.getWeightPercentageString()})] - valued at ${this.value} gold`;
    }

    getDetails() {
        return `${this.fishID}_${this.fishRarity}_${this.weight}`;
    }

    getWeightPercentageString() {
        let weightPercentage = Math.floor(((this.weight - this.weightRolls[0])/(this.weightRolls[1] - this.weightRolls[0])) * 10000) / 100;

        return `${weightPercentage}%`;
    }

    toJSON() {
        return {
            _id: this.fishID,
            fish_name: this.fishName,
            fish_rarity: this.fishRarity,
            weight_rolls: this.weightRolls,
            weight: this.weight,
            value: this.value,
        }
    }

    static fromJSON(data) {
        let fish = new Fish(data._id, data.fish_name, data.fish_rarity, data.weight_rolls);
        fish.weight = data.weight;
        fish.value = data.value;

        return fish;
    }
}