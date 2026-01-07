import { Enemy } from './enemy.js';
import { Player } from './player.js';

export async function battle(player, enemy) {
    while (player.health > 0 && enemy.enemyHealth > 0) {
        playerTurn(player, enemy);
        enemyTurn(player, enemy);
    }

    // If player loses
    if (player.health <= 0) {
        return {
            victory: false,
        };
    }
    // If player wins
    else {
        let goldGain = calcGoldGain(enemy);
        player.gold += goldGain;

        return {
            victory: true,
            goldGained: goldGain
        };
    }
}

export async function duel(player, opponent) {
    while (player.health > 0 && opponent.health > 0) {
        playerTurn(player, opponent);
        playerTurn(opponent, player);
    }

    // If player loses
    if (player.health <= 0 && opponent.health <= 0) {
        return {
            victory: "uncertain",
        }
    }
    else if (player.health <= 0) {
        return {
            victory: false,
        };
    }
    // If player wins
    else {
        return {
            victory: true,
        };
    }
}

function playerTurn(player, enemy) {
    let spell = player.getRandomSpell();

    console.log(`Player Turn`);
    console.log(`${player.username} casts ${spell.spellName}`);

    enemy.takeDamage(calculateDamage(player, spell));
}

function enemyTurn(player, enemy) {
    console.log('Enemy Turn');

    player.takeDamage(enemy.enemyDamage);
}

function calcGoldGain(enemy) {
    let range = [100 * Math.pow(2, enemy.enemyTier), 100 * Math.pow(2, enemy.enemyTier + 1)]

    let value = Math.floor(Math.random() * (range[1] - range[0] + 1))+ range[0];

    return value;
}

export function calculateDamage(player, spell) {
    let [scorchDam, voltDam, freezeDam] = spell.baseDamage;
    const [
        incScorchDam,
        incVoltDam,
        incFreezeDam,
        incProjDam,
        incAreaDam
    ] = player.increasedDamages;

    // Apply damage multipliers to scorch damage
    let totalIncreasedDamage = calculateTagIncreases(player, spell, incScorchDam);

    scorchDam *= (1 + Math.floor(totalIncreasedDamage / 100));

    // Apply damage multipliers to volt damage
    totalIncreasedDamage = calculateTagIncreases(player, spell, incVoltDam);

    voltDam *= (1 + Math.floor(totalIncreasedDamage / 100));

    // Apply damage multipliers to freeze damage
    totalIncreasedDamage = calculateTagIncreases(player, spell, incFreezeDam);

    freezeDam *= (1 + Math.floor(totalIncreasedDamage / 100));

    return [scorchDam, voltDam, freezeDam];
}

function calculateTagIncreases(player, spell, increase) {
    const [
        incScorchDam,
        incVoltDam,
        incFreezeDam,
        incProjDam,
        incAreaDam
    ] = player.increasedDamages;

    spell.tags.forEach((tag) => {
        switch (tag) {
            case "Projectile":
                increase += incProjDam;
            case "Area":
                increase += incAreaDam;
            default:
                break;
        }
    })

    return increase;
}