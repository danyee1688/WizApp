import mongoose from "mongoose";
import { Player } from "./player.js";

const PlayerSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    username: String,
    gold: Number,
    stats: {
        max_health: Number,
        resistances: [Number],
        attributes: [Number],
    },
    spell_list: [
        {
            _id: Number,
            spell_name: String,
            base_damage: [Number],
            tags: [String],
        }
    ],
    inventory: {
        staff: Object,
        amulet: Object,
        ring1: Object,
        ring2: Object,
        belt: Object,
    }
});

export const PlayerModel = mongoose.model("Player", PlayerSchema);

export async function connectToDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connection successful");
    } catch (err) {
        console.error("MongoDB connection failed: ", err);
        process.exit(1);
    }
}

export async function savePlayer(player) {
    console.log("Saving player ", player.userID);

    await PlayerModel.findByIdAndUpdate(
        player.userID,
        player.toJSON(),
        { upsert: true }
    )
}

export async function loadPlayer(userID) {
    const doc = await PlayerModel.findById(userID).lean();

    let player = Player.fromJSON(doc);
    player.evaluateItems();

    return player;
}

export async function hasPlayer(userID) {
    console.log(`Finding user ${userID}`);

    const exists = await PlayerModel.exists({ _id: userID });

    if (!!exists === true) {
         console.log(`User found`);
         return true;
    } 
    else {
        console.log(`User not found`);
        return false;
    }
}