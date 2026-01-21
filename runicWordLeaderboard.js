import mongoose from "mongoose";
import { loadPlayer } from "./playerManager.js";

const RunicWordStat = new mongoose.Schema({
    _id: {
        type: Number,
        required: true,
    },
    userID: {
        type: String,
        required: true,
    },
    score: Number,
    date: String,
}, {_id: false});

export const RunicWordStatModel = mongoose.model("RunicWordStat", RunicWordStat);

// Save stat to leaderboard
export async function saveStat(place, userID, score) {
    console.log("Saving runic words stat");

    let date = new Date();
    let dateString =
        `${date.getMonth() + 1}`
        + '-'
        + date.getDate() 
        + '-'
        + date.getFullYear()
        + '-'
        + date.getHours()
        + ':'
        + date.getMinutes()
        + ':'
        + date.getSeconds();

    await RunicWordStatModel.findByIdAndUpdate(
        place,
        {
            userID: userID,
            score: score,
            date: dateString,
        },
        { upsert: true }
    )
}

// Load stat from leaderboard
export async function loadStat(place) {
    let stat = await RunicWordStatModel.findById(place);

    return stat;
}

// Compare scores to each other and move entries
// as necessary
export async function compareToStats(userID, score) {
    let index = 0;

    for (let i = 0; i < 10; i++) {
        index++;

        let stat = await loadStat(index);

        if (stat === null ) {
            break;
        }
        else if (score > stat.score) {
            for (let j = 9; j >= index; j--) {
                let statTemp = await loadStat(j);

                if (statTemp) {
                    saveStat(j + 1, await loadPlayer(statTemp.userID), statTemp.score);
                }
            }

            break;
        }
    }
    if (index <= 10) {
        await saveStat(index, userID, score);
    }
}