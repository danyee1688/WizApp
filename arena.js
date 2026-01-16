import { InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { chance } from "./chance.js";
import { ArenaDB } from "./arenaDB.js";
import { 
    playerTurn, 
    calculateDamage
} from "./combat.js";
import { loadPlayer } from "./playerManager.js";

export class Arena {
    constructor(users) {
        this.users = users;
        this.players = [];
    }

    async startArena() {
        // Populate player list
        for (let i = 0; i < this.users.length; i++) {
            let player = await loadPlayer(this.users[i]);
            this.players.push(player);
        }

        // Reduce each player's max health by 4
        // Reduce each player's health by 4
        // For reduced fight length
        this.players.forEach((player) => {
            player.maxHealth = Math.floor(player.maxHealth / 4);
            player.health = player.maxHealth;
        });

        // Update messages array
        let messages = [];

        while (this.players.length > 1) {
            // 25% chance for nothing to happen and
            // get miscellaneous message 
            // 75% chance for player to attack another player
            // get combat message
            if (chance(25)) {
                let player = this.getRandomPlayer(this.players);

                messages.push(ArenaDB.getRandomMiscMessage(player.username));
            }
            else {
                let playerList = this.players;
                let player = this.getRandomPlayer(playerList);
                playerList = playerList.filter((playerTemp) => playerTemp !== player);
                let target = this.getRandomPlayer(playerList);
                let spell = player.getRandomSpell();
                let damageDoneString = target.takeDamage(calculateDamage(player, spell).damage);

                // Update messages array
                messages.push(`${ArenaDB.getRandomCombatMessage(player.username, target.username, spell.spellName)}` + "\n" + `${damageDoneString}`);

                // Cull players who have died
                messages = messages.concat(this.cullPlayers());
            }
        }

        // Update messages array with victor
        messages.push(`<@${this.players[0].userID}> is the winner!`);

        console.log("ARENA MESSAGES");
        console.log(messages);

        return {
            message: messages,
            victor: this.players[0]
        };
    }

    // Grab random player from specified list
    getRandomPlayer(playerList) {
        let randomIndex = Math.floor(Math.random() * playerList.length);

        return playerList[randomIndex];
    }

    // Remove players with less than or equal to 0 health 
    // Return as a message array
    cullPlayers() {
        let messages = [];

        for (let i = this.players.length - 1; i >= 0; i--) {
            if (this.players[i]?.health <= 0) {
                messages.push(`${this.players[i].username} has perished.`);

                delete this.players[i];
                this.players = this.players.filter((player) => player != null);
            }
        }

        return messages;
    }
}

