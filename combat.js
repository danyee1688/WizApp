import { Enemy } from './enemy.js';
import { Player } from './player.js';
import { chance } from './chance.js';

// Start battle between a player and non-player enemy
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

        return {
            victory: true,
            goldGained: goldGain
        };
    }
}

// Start battle between two players from /duel
export async function duel(player, opponent) {
    while (player.health > 0 && opponent.health > 0) {
        playerTurn(player, opponent);
        playerTurn(opponent, player);
    }

    // Tie outcome
    if (player.health <= 0 && opponent.health <= 0) {
        return {
            victory: "uncertain",
        }
    }
    // If player loses
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

// Player turn during combat, choose spell and apply damage
export function playerTurn(player, enemy) {
    let spell = player.getRandomSpell();

    console.log(`Player Turn`);
    console.log(`${player.username} casts ${spell.spellName}`);

    enemy.takeDamage(calculateDamage(player, spell).damage);
}

// Non-player enemy turn during combat, apply damage
function enemyTurn(player, enemy) {
    console.log('Enemy Turn');

    player.takeDamage(enemy.enemyDamage);
}

// Calculate gold gain from killing a non-player enemy
function calcGoldGain(enemy) {
    let range = [75 * Math.pow(3, enemy.enemyTier), 75 * Math.pow(3, enemy.enemyTier + 1)]

    let value = Math.floor(Math.random() * (range[1] - range[0] + 1))+ range[0];

    return value;
}

// Calculate damage done by a spell
// Returns whether or not the damage done was a critical hit
// Returns an array of damage types: scorch, volt, freeze
export function calculateDamage(player, spell) {
    let [scorchDam, voltDam, freezeDam] = spell.baseDamage;
    const [
        incScorchDam,
        incVoltDam,
        incFreezeDam,
        incProjDam,
        incAreaDam
    ] = player.increasedDamages;

    // Damage calculations
    // Check if critical hit
    // Increases to damage first, 
    // then multiplicatively apply increases to damage from critting, if applicable

    // Critical hit calculations
    let critResult = critChanceCheck(player, spell);
    let critDamage = calculateCritMultiplier(player, spell);

    // Apply damage multipliers to scorch damage
    let totalIncreasedDamage = calculateTagIncreases(player, spell, incScorchDam);
    scorchDam = calculatePercentageIncrease(scorchDam, totalIncreasedDamage);
    if (critResult === true) {
        scorchDam = calculatePercentageIncrease(scorchDam, critDamage);
    }
    // Apply damage multipliers to volt damage
    totalIncreasedDamage = calculateTagIncreases(player, spell, incVoltDam);
    voltDam = calculatePercentageIncrease(voltDam, totalIncreasedDamage);
    if (critResult === true) {
        voltDam = calculatePercentageIncrease(voltDam, critDamage);
    }
    // Apply damage multipliers to freeze damage
    totalIncreasedDamage = calculateTagIncreases(player, spell, incFreezeDam);
    freezeDam = calculatePercentageIncrease(freezeDam, totalIncreasedDamage);
    if (critResult === true) {
        freezeDam = calculatePercentageIncrease(freezeDam, critDamage);
    }

    return {
        crit: critResult,
        damage: [scorchDam, voltDam, freezeDam],
    };
}

// Additive increases for modifiers that increase damage
function calculateTagIncreases(player, spell, baseIncrease) {
    const [
        incDam,
        incScorchDam,
        incVoltDam,
        incFreezeDam,
        incProjDam,
        incAreaDam
    ] = player.increasedDamages;

    let totalIncrease = baseIncrease;

    totalIncrease += incDam;

    spell.tags.forEach((tag) => {
        switch (tag) {
            case "Projectile":
                totalIncrease += incProjDam;
                break;
            case "Area":
                totalIncrease += incAreaDam;
                break;
            default:
                break;
        }
    })

    return totalIncrease;
}

// Returns boolean after calculating critical hit chance 
function critChanceCheck(player, spell) {
    const baseCritChance = spell.critChance;
    let totalIncCritChance = 0;

    const [
        [increasedCritChance, addedCritDamage],
        [increasedScorchCritChance, addedScorchCritDamage],
        [increasedVoltCritChance, addedVoltCritDamage],
        [increasedFreezeCritChance, addedFreezeCritDamage],
        [increasedProjectileCritChance, addedProjectileCritDamage],
        [increasedAreaCritChance, addedAreaCritDamage],
    ] = player.increasedCrits;

    totalIncCritChance += increasedCritChance;

    spell.tags.forEach((tag) => {
        switch (tag) {
            case "Scorch":
                totalIncCritChance += increasedScorchCritChance;
                break;
            case "Volt":
                totalIncCritChance += increasedVoltCritChance;
                break;
            case "Freeze":
                totalIncCritChance += increasedFreezeCritChance;
                break;
            case "Projectile":
                totalIncCritChance += increasedProjectileCritChance;
                break;
            case "Area":
                totalIncCritChance += increasedAreaCritChance;
                break;
            default:
                break;
        }
    })

    let calculatedCritChance = calculatePercentageIncrease(baseCritChance, totalIncCritChance);

    if (chance(calculatedCritChance) === true) {
        return true;
    }
    else {
        return false;
    }
}

// Additive critical hit damage calculations
function calculateCritMultiplier(player, spell) {
    const baseCritDamage = spell.critDamage;
    let totalAddedCritDamage = 0;

    const [
        [increasedCritChance, addedCritDamage],
        [increasedScorchCritChance, addedScorchCritDamage],
        [increasedVoltCritChance, addedVoltCritDamage],
        [increasedFreezeCritChance, addedFreezeCritDamage],
        [increasedProjectileCritChance, addedProjectileCritDamage],
        [increasedAreaCritChance, addedAreaCritDamage],
    ] = player.increasedCrits;

    totalAddedCritDamage += addedCritDamage;

    spell.tags.forEach((tag) => {
        switch (tag) {
            case "Scorch":
                totalAddedCritDamage += addedScorchCritDamage;
                break;
            case "Volt":
                totalAddedCritDamage += addedVoltCritDamage;
                break;
            case "Freeze":
                totalAddedCritDamage += addedFreezeCritDamage;
                break;
            case "Projectile":
                totalAddedCritDamage += addedProjectileCritDamage;
                break;
            case "Area":
                totalAddedCritDamage += addedAreaCritDamage;
                break;
            default:
                break;
        }
    })

    // - 100 for padding, crit damage technically starts at 0
    // but is set at 100+ for visual purposes
    return baseCritDamage - 100 + totalAddedCritDamage;
}

// Simple percentage increase helper function
function calculatePercentageIncrease(value, percentage) {
    return Math.floor(value * (1 + (percentage / 100)));
}