import mongoose from "mongoose";
import { Player } from "./player.js";

const PlayerSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    privacy: String,
    username: String,
    gold: Number,
    stats: {
        max_health: Number,
        resistances: [Number],
        attributes: [Number],
    },
    info: {
        enemiesKilled: Number,
        arenasWon: Number,
        duelsWon: Number,
        fishCaught: Number,
        lootCratesOpened: Number,
    },
    spell_list: [
        {
            _id: Number,
            tier: Number,
            spell_name: String,
            base_damage: [Number],
            crit_chance: Number,
            crit_damage: Number,
            tags: [String],
        }
    ],
    inventory: {
        staff: Object,
        amulet: Object,
        ring1: Object,
        ring2: Object,
        belt: Object,
    },
    fish_list: [
        {
            _id: Number,
            fish_name: String,
            fish_rarity: String,
            weight_rolls: [Number],
            weight: Number,
            value: Number,
        } 
    ],
    familiars: [
        {
            familiarID: Number,
            familiarName: String,
            moveSet: [Object],
            tier: Number
        }
    ]
});

export const PlayerModel = mongoose.model("Player", PlayerSchema);

// Connect to DB by URI
export async function connectToDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connection successful");
    } catch (err) {
        console.error("MongoDB connection failed: ", err);
        process.exit(1);
    }
}

// Saves player to DB
export async function savePlayer(player) {
    console.log("Saving player ", player.userID);

    await PlayerModel.findByIdAndUpdate(
        player.userID,
        player.toJSON(),
        { upsert: true }
    )
}

// Loads player from DB
export async function loadPlayer(userID) {
    const doc = await PlayerModel.findById(userID).lean();

    let player = Player.fromJSON(doc);
    player.evaluateItems();

    return player;
}

export async function loadAllPlayers() {
    let playerList = [];
    const docs = await PlayerModel.find({});

    docs.forEach((doc) => {
        let player = Player.fromJSON(doc);
        player.evaluateItems();

        playerList.push(player);
    });

    return playerList;
}

// Returns boolean based on whether or not player exists in DB
// Checks by discord user ID
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

// Call this function to reload player schema
export async function reloadDatabase() {
    let playerList = await loadAllPlayers();

    for (let i = 0; i < playerList.length; i++) {
        await savePlayer(playerList[i]);
    }
}