import { MessageComponentTypes } from "discord-interactions";
import { loadAllPlayers } from "./playerManager.js";
import { loadFishingStat } from "./fishingLeaderboard.js";
import { Fish } from "./fish.js";
import { loadStat } from "./runicWordLeaderboard.js";

// Return components for gold amount leaderboard
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

// Return components for enemies killed leaderboard
export async function getEnemiesKilledLeaderboard() {
    let playerList = await loadAllPlayers();

    // Sort player list by enemies killed
    // Only get the top 10 results
    // Filter out players with 0 enemies killed
    playerList.sort(playerCompareEnemiesKilled);
    playerList.slice(0, 9);
    playerList = playerList.filter((player) => {
        return Number(player.info.enemiesKilled) > 0;
    });

    let componentList = [];

    for (let i = 0; i < playerList.length; i++) {
        componentList.push({
            type: MessageComponentTypes.TEXT_DISPLAY,
            content: `${i + 1}. <@${playerList[i].userID}> - ${playerList[i].info.enemiesKilled} enemies killed`
        })
    }

    return componentList;
}

// Return components for arena wins leaderboard
export async function getArenaWinsLeaderboard() {
    let playerList = await loadAllPlayers();

    // Sort player list by arenas won
    // Only get the top 10 results
    // Filter out players with 0 arenas won
    playerList.sort(playerCompareArenasWon);
    playerList.slice(0, 9);
    playerList = playerList.filter((player) => {
        return Number(player.info.arenasWon) > 0;
    });

    let componentList = [];

    for (let i = 0; i < playerList.length; i++) {
        componentList.push({
            type: MessageComponentTypes.TEXT_DISPLAY,
            content: `${i + 1}. <@${playerList[i].userID}> - ${playerList[i].info.arenasWon} arenas won`
        })
    }

    return componentList;
}

// Return components for duels won leaderboard
export async function getDuelsWonLeaderboard() {
    let playerList = await loadAllPlayers();

    // Sort player list by duels won
    // Only get the top 10 results
    // Filter out players with 0 duels won
    playerList.sort(playerCompareDuelsWon);
    playerList.slice(0, 9);
    playerList = playerList.filter((player) => {
        return Number(player.info.duelsWon) > 0;
    });

    let componentList = [];

    for (let i = 0; i < playerList.length; i++) {
        componentList.push({
            type: MessageComponentTypes.TEXT_DISPLAY,
            content: `${i + 1}. <@${playerList[i].userID}> - ${playerList[i].info.duelsWon} duels won`
        })
    }

    return componentList;
}

// Return components for fishing value leaderboard
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
            });
            
            componentList.push({
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `-#    on ${fishingStat.date}`
            });
        }
    }

    return componentList;
}

// Return components for runic words leaderboard
export async function getRunicWordsLeaderboard() {
    let componentList = [];

    // Get non-null runic word stats
    for (let i = 1; i <= 10; i++) {
        let stat = await loadStat(i);

        if (stat) {
            componentList.push({
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `${i}. <@${stat.userID}> - ${stat.score} Points`
            });

            componentList.push({
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `-#    on ${stat.date}`
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

function playerCompareEnemiesKilled(player1, player2) {
    if (player1.info.enemiesKilled < player2.info.enemiesKilled) {
        return 1;
    }
    else if (player1.info.enemiesKilled > player2.info.enemiesKilled) {
        return -1;
    }

    return 0;
}

function playerCompareArenasWon(player1, player2) {
    if (player1.info.arenasWon < player2.info.arenasWon) {
        return 1;
    }
    else if (player1.info.arenasWon > player2.info.arenasWon) {
        return -1;
    }

    return 0;
}

function playerCompareDuelsWon(player1, player2) {
    if (player1.info.duelsWon < player2.info.duelsWon) {
        return 1;
    }
    else if (player1.info.duelsWon > player2.info.duelsWon) {
        return -1;
    }

    return 0;
}