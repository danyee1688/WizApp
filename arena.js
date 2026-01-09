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
        for (let i = 0; i < this.users.length; i++) {
            let player = await loadPlayer(this.users[i]);

            this.players.push(player);
        }

        this.players.forEach((player) => {
            player.maxHealth = Math.floor(player.maxHealth / 4);
            player.health = player.maxHealth;
        });

        let messages = [];

        while (this.players.length > 1) {
            if (chance(50)) {
                let player = this.getRandomPlayer(this.players);

                messages.push(ArenaDB.getRandomMiscMessage(player.username));
            }
            else {
                let playerList = this.players;
                // console.log("player list before deletion");
                // console.log(playerList);
                let player = this.getRandomPlayer(playerList);
                // console.log("player: ", player.username);
                playerList = playerList.filter((playerTemp) => playerTemp !== player);
                // console.log("player list after deletion");
                // console.log(playerList);
                let target = this.getRandomPlayer(playerList);
                // console.log("target: ", target.username);
                let spell = player.getRandomSpell();
                let damageDoneString = target.takeDamage(calculateDamage(player, spell).damage);

                messages.push(`${ArenaDB.getRandomCombatMessage(player.username, target.username, spell.spellName)}` + "\n" + `${damageDoneString}`);

                // Cull players who have died
                messages = messages.concat(this.cullPlayers());
            }
        }

        messages.push(`<@${this.players[0].userID}> is the winner!`);

        console.log("ARENA MESSAGES");
        console.log(messages);

        return messages;
    }

    getRandomPlayer(playerList) {
        let randomIndex = Math.floor(Math.random() * playerList.length);

        return playerList[randomIndex];
    }

    cullPlayers() {
        let messages = [];

        for (let i = this.players.length - 1; i >= 0; i--) {
            if (this.players[i]?.health <= 0) {
                // console.log("player culled: ", this.players[i].username);

                messages.push(`${this.players[i].username} has perished.`);

                delete this.players[i];
                this.players = this.players.filter((player) => player != null);
            }
        }

        return messages;
    }
}

