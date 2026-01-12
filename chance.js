// Selects an option from 'choices' with given 'weights' list
// Weighted choice returns an option from 'choices'
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

// Function to apply simple RNG
// Supports 2 decimal precision
// Returns boolean
export function chance(percentage) {
    let value = (Math.random() * 100);

    if (value < percentage) {
        return true;
    }
    else {
        return false;
    }
}