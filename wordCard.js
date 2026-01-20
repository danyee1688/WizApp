import { ButtonStyleTypes, MessageComponentTypes } from "discord-interactions";
import { randomUUID } from "crypto";

export class WordCard {
    constructor(cardID, cardName) {
        this.cardID = cardID,
        this.cardName = cardName,
        this.value = 0;
    }

    static copyCard(card) {
        return new WordCard(card.cardID, card.cardName);
    }

    toString() {
        if (this.cardName === 'Insert') {
            return `${this.cardName} ${this.value.letter} at ${this.value.index}`;
        }
        else if (this.cardName === 'Remove') {
            return `${this.cardName} at ${this.value}`;
        }
        else if (this.cardName === 'Clear') {
            return `${this.cardName}`;
        }
        else {
            return `${this.cardName} ${this.value}`;
        }
    }

    toComponent() {
        if (this.cardName === "Insert") {
            let letter = this.value.letter;
            let index = this.value.index;

            let retVal = {
                type: MessageComponentTypes.BUTTON,
                label: this.toString(),
                custom_id: `${this.cardName.toLowerCase()}_${letter}_${index}_${randomUUID()}`,
                style: ButtonStyleTypes.PRIMARY,
            }

            return retVal;
        }
        else if (this.cardName === "Clear") {
            let retVal = {
                type: MessageComponentTypes.BUTTON,
                label: this.toString(),
                custom_id: `${this.cardName.toLowerCase()}_${randomUUID()}`,
                style: ButtonStyleTypes.PRIMARY,
            }

            return retVal;
        }
        else {
            let retVal = {
                type: MessageComponentTypes.BUTTON,
                label: this.toString(),
                custom_id: `${this.cardName.toLowerCase()}_${this.value}_404_${randomUUID()}`,
                style: ButtonStyleTypes.PRIMARY,
            }

            return retVal;
        }
    }
}