import { WordCard } from "./wordCard.js";
import { weightedChoice } from "./chance.js";
import { Alphabet } from "./alphabet.js";

export class WordCardDB {
    static soloCardList = [
        new WordCard(0, "Append"),
        new WordCard(1, "Prepend"),
        new WordCard(2, "Insert"),
        new WordCard(3, "Add Prefix"),
        new WordCard(4, "Add Suffix"),
        new WordCard(5, "Remove"),
    ]

    static soloCardWeights = [
        10, // Append
        10, // Prepend
        8, // Insert
        4, // Add Prefix
        4, // Add Suffix
        4, // Remove
    ]

    static prefixList = [
        "RE",
        "DE",
        "IN",
        "UN",
        "PRE",
        "ST",
        "SH",
        "CH",
        "WH",
        "TH",
        "IM",
        "TR",
        "PL",
    ]

    static suffixList = [
        "ING",
        "ION",
        "AL",
        "NESS",
        "ER",
        "ED",
        "RT",
        "TY",
    ]

    static getRandomPrefix() {
        let randomIndex = Math.floor(Math.random() * this.prefixList.length);

        return this.prefixList[randomIndex];
    }

    static getRandomSuffix() {
        let randomIndex = Math.floor(Math.random() * this.suffixList.length);

        return this.suffixList[randomIndex];
    }

    static getRandomSoloCard(word) {
        let card = WordCard.copyCard(weightedChoice(this.soloCardList, this.soloCardWeights));

        this.setCardValue(word, card);

        return card;
    }

    static setCardValue(word, card) {
        switch (card.cardID) {
            case 0:
                card.value = Alphabet.getRandomLetter();

                break;
            case 1:
                card.value = Alphabet.getRandomLetter();

                break;
            case 2:
                card.value = {
                    letter: Alphabet.getRandomLetter(),
                    index: Math.floor(Math.random() * word.length),
                };

                break;
            case 3:
                card.value = this.getRandomPrefix();

                break;
            case 4:
                card.value = this.getRandomSuffix();

                break;
            case 5:
                card.value = Math.floor(Math.random() * word.length);

                break;
            case 6:
                card.value = 0;
        }

        return card;
    }
}