import { Enemy } from './enemy.js';
import { weightedChoice } from './chance.js';

export class EnemyDB {
    static enemyListTier0 = [
        new Enemy(0, 0, "Freeze Slime", 250, [0, 0, 30], [0, 0, 100]),
        new Enemy(1, 0, "Scorch Slime", 250, [30, 0, 0], [100, 0, 0]),
        new Enemy(2, 0, "Volt Slime", 250, [0, 30, 0], [0, 100, 0]),
        new Enemy(3, 0, "Gooblin", 100, [50, 0, 0], [0, 0, 0]),
        new Enemy(4, 0, "Stick Man", 100, [0, 0, 30], [10, 10, 10]),
        new Enemy(5, 0, "Rabid Hot Dog", 200, [45, 0, 0], [30, 0, 10]),
        new Enemy(6, 0, "Flaming Skeleton", 280, [25, 25, 0], [0, 0, 50]),
        new Enemy(7, 0, "Thief", 320, [10, 0, 10], [15, 10, 15]),
        new Enemy(8, 0, "Underling of Snowballery", 300, [0, 0, 30], [5, 5, 50]),
        new Enemy(9, 0, "Drunk Scorchborne", 390, [25, 0, 10], [30, 0, 0]),
    ]

    static enemyListTier1 = [
        new Enemy(0, 1, "Rocc", 2000, [0, 10, 0], [50, 50, 50]),
        new Enemy(1, 1, "Priest of Snowballery", 700, [0, 0, 40], [0, 10, 80]),
        new Enemy(2, 1, "Arcane Witch", 820, [20, 20, 20], [30, 30, 30]),
        new Enemy(3, 1, "Heinous Scavenger", 580, [20, 0, 30], [20, 10, 20]),
        new Enemy(4, 1, "Blazing Dart Monger", 660, [45, 0, 0], [100, 10, 10]),
        new Enemy(5, 1, "Shock Golem", 900, [0, 35, 0], [20, 20, 20]),
        new Enemy(6, 1, "Scorchborne", 390, [40, 0, 10], [40, 10, 10]),
        new Enemy(7, 1, "Shrooblin", 400, [0, 50, 10], [0, 0, 0]),
    ]

    static enemyListTier2 = [
        new Enemy(0, 2, "Gargoyle of the Volcanos", 1250, [60, 0, 0], [75, 15, 15]),
        new Enemy(1, 2, "Archpriest of Snowballery", 1400, [0, 0, 50], [0, 10, 100]),
        new Enemy(2, 2, "Luhk, God of Gambling", 4000, [7, 7, 7], [7, 7, 7])
    ]

    static enemyLists = [
        this.enemyListTier0,
        this.enemyListTier1,
        this.enemyListTier2,
    ]

    static enemyRarityWeights = [
        20,
        4,
        1
    ]

    // Grab random enemy, weighted by enemy tier
    static getRandomEnemy() {
        let listTemp = weightedChoice(this.enemyLists, this.enemyRarityWeights);

        let randomIndex = Math.floor(Math.random() * listTemp.length);
        let randomEnemy = listTemp[randomIndex];

        return this.copyEnemy(randomEnemy);
    }

    // Copy enemy by object
    // Avoids persistent changes to objects
    static copyEnemy(enemy) {
        return new Enemy(enemy.enemyID, enemy.enemyTier, enemy.enemyName, enemy.enemyMaxHealth, enemy.enemyDamage, enemy.enemyResistances);
    }

    // Find an enemy object by ID and tier
    static findEnemyByID(enemyTier, enemyID) {
        return this.copyEnemy(this.enemyLists[enemyTier][enemyID]);
    }
}