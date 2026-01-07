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

    getParsedDescription() {
        // Replace hashtag with corresponding value in stat
        let description = this.description.replace("#", this.value.toString());
        //console.log(`stat ${this.statID} description parsed into: `, description);
        return description; 
    }

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

    static fromJSON(data) {
        let stat =  new Stat(data.statID, data.statName, data.description, data.ranges, data.allowedOnTypes);
        stat.tier = data.tier;
        stat.value = data.value;

        return stat;
    }
}