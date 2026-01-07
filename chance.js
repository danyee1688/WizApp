export function weightedChoice(choices, weights) {
    if (choices.length != weights.length) {
        console.error("Mismatching choice and weight lengths.");

        return null;
    }
    else {
        let list = [];

        for (let i = 0; i < weights.length; i++) {
            for (let j = 0; j < weights[i]; j++) {
                list.push(choices[i]);
            }
        }

        let randomIndex = Math.floor(Math.random() * list.length);

        return list[randomIndex];
    }
}

export function chance(percentage) {
    let value = (Math.random() * 100);

    if (value < percentage) {
        return true;
    }
    else {
        return false;
    }
}