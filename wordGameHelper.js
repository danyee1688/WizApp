import { Alphabet } from "./alphabet.js";

export class WordGameHelper {
    static activeSoloWordGames = {};

    static startNewGame(userID) {
        this.activeSoloWordGames[userID] = {
            score: 0,
            activeWord: Alphabet.getRandomLetter(),
            actionsLeft: 15,
            hand: [],
            wordsSubmitted: [],
        }
    }

    static getScore(word) {
        let score = 0;

        for (let i = 0; i < word.length; i++) {
            score += Alphabet.alphabetScoreValues[word[i]];
        }

        console.log(`${word} scores ${score}`);

        return score;
    }
}