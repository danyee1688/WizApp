import { Alphabet } from "./alphabet.js";
import { compareToStats } from "./runicWordLeaderboard.js";
import { 
    InteractionResponseType,
    InteractionResponseFlags,
    MessageComponentTypes,
    ButtonStyleTypes,

 } from "discord-interactions";

export class WordGameHelper {
    static activeSoloWordGames = {};

    static startNewGame(userID) {
        this.activeSoloWordGames[userID] = {
            score: 0,
            activeWord: Alphabet.getRandomLetter(),
            actionsLeft: 25,
            hand: [],
            wordsSubmitted: [],
        }
    }

    static getScore(word) {
        let score = 0;

        for (let i = 0; i < word.length; i++) {
            score += Alphabet.alphabetScoreValues[word[i]];
        }

        score += Math.pow(3, word.length - 3);

        console.log(`${word} scores ${score}`);

        return score;
    }

    static async showGameOver(res, wordGame, userID) {
        await compareToStats(userID, wordGame.score);

        await res.send({
            type: InteractionResponseType.UPDATE_MESSAGE,
            data: {
                flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                components: [
                    {
                        type: MessageComponentTypes.CONTAINER,
                        components: [
                            {
                                type: MessageComponentTypes.TEXT_DISPLAY,
                                content: '## 🔡 Runic Words'
                            },
                            {
                                type: MessageComponentTypes.TEXT_DISPLAY,
                                content: `### Game Over!`,
                            },
                            {
                                type: MessageComponentTypes.SEPARATOR,
                                spacing: 1.5,
                            },
                            {
                                type: MessageComponentTypes.TEXT_DISPLAY,
                                content: `### Points: ${wordGame.score}`,
                            },
                            {
                                type: MessageComponentTypes.TEXT_DISPLAY,
                                content: `Words Submitted:\n${wordGame.wordsSubmitted}`,
                            }
                        ]
                    }
                ]
            }
        });
    }
}