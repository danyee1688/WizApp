import mongoose from "mongoose";
import { loadPlayer } from "./playerManager.js";

const FishingStatSchema = new mongoose.Schema({
    _id: {
        type: Number,
        required: true,
    },
    userID: {
        type: String,
        required: true,
    },
    username: String,
    fish: {
        _id: Number,
        fish_name: String,
        fish_rarity: String,
        weight_rolls: [Number],
        weight: Number,
        value: Number,
    },
    date: String,
}, {_id: false});

export const FishingStatModel = mongoose.model("FishingStat", FishingStatSchema);

export async function saveFishingStat(place, player, fish) {
    console.log("Saving fishing stat");

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

    await FishingStatModel.findByIdAndUpdate(
        place,
        {
            userID: player.userID,
            username: player.username,
            fish: fish.toJSON(),
            date: dateString,
        },
        { upsert: true }
    )
}

export async function loadFishingStat(place) {
    let fishingStat = await FishingStatModel.findById(place);

    return fishingStat;
}

export async function compareToFishingStats(player, fish) {
    let index = 0;

    for (let i = 0; i < 10; i++) {
        index++;

        let fishingStat = await loadFishingStat(index);

        if (fishingStat === null ) {
            break;
        }
        else if (fish.value > fishingStat.fish.value) {
            for (let j = 9; j >= index; j--) {
                let fishingStatTemp = await loadFishingStat(j);

                if (fishingStatTemp) {
                    saveFishingStat(j + 1, await loadPlayer(fishingStatTemp.userID), fishingStatTemp.fish)
                }
            }

            break;
        }
    }
    if (index <= 10) {
        await saveFishingStat(index, player, fish);
    }
}