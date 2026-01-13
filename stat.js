export class Stat {
    constructor(statID, statName, description, ranges, allowedOnTypes) {
        this.statID = statID;
        this.statName = statName;
        this.description = description;
        this.tier = 0;
        this.value = 0;
        this.ranges = ranges;
        this.allowedOnTypes = allowedOnTypes;
    }

    // Returns parsed description with value
    getParsedDescription() {
        // Replace hashtag with corresponding value in stat
        let description = `[T${this.tier + 1}] ` + this.description.replace("#", this.value.toString());
        
        return description; 
    }

    // Convert object to JSON
    toJSON() {
        return {
            statID: this.statID,
            statName: this.statName,
            description: this.description,
            tier: this.tier,
            value: this.value,
            ranges: this.ranges,
            allowedOnTypes: this.allowedOnTypes,
        }
    }

    // Convert JSON to object
    static fromJSON(data) {
        let stat =  new Stat(data.statID, data.statName, data.description, data.ranges, data.allowedOnTypes);
        stat.tier = data.tier;
        stat.value = data.value;

        return stat;
    }
}