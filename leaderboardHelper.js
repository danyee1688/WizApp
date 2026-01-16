import { MessageComponentTypes } from "discord-interactions";
import { loadAllPlayers } from "./playerManager.js";
import { loadFishingStat } from "./fishingLeaderboard.js";
import { Fish } from "./fish.js";

export async function getGoldLeaderboard() {
    let playerList = await loadAllPlayers();

    // Sort player list by gold amount
    // Only get the top 10 results
    // Filter out players with 0 gold
    playerList.sort(playerCompareGold);
    playerList.slice(0, 9);
    playerList = playerList.filter((player) => {
        return Number(player.gold) > 0;
    });

    let componentList = [];

    for (let i = 0; i < playerList.length; i++) {
        componentList.push({
            type: MessageComponentTypes.TEXT_DISPLAY,
            content: `${i + 1}. <@${playerList[i].userID}> - ${playerList[i].gold} gold`
        })
    }

    return componentList;
}

export async function getFishingValueLeaderboard() {
    let componentList = [];
    
    // Get non-null fishing stats
    for (let i = 1; i <= 10; i++) {
        let fishingStat = await loadFishingStat(i);

        if (fishingStat !== null) {
            let fish = Fish.fromJSON(fishingStat.fish);

            componentList.push({
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `${i}. ${fish.getShortenedDetails()} - Caught by <@${fishingStat.userID}>`
            })
            
            componentList.push({
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `-# at ${fishingStat[i]}`
            });
        }
    }

    return componentList;
}

function playerCompareGold(player1, player2) {
    if (player1.gold < player2.gold) {
        return 1;
    }
    else if (player1.gold > player2.gold) {
        return -1;
    }

    return 0;
}