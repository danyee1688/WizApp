import fs from 'node:fs/promises';

export class WordLibrary {
    static wordList = [];

    static async setup() {
        try {
            const data = await fs.readFile("/Users/yinfanpang/Documents/Dan_Personal/Discord/TestApp/WizApp/words.txt",
                { encoding: 'utf8'}
            );

            this.wordList = data.toLowerCase().split('\n');

            console.log("Word library setup complete");
        } catch (err) {
            console.error("Error on word library setup: ", err);
        }
    }
}