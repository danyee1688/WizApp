import {
  ButtonStyleTypes,
  MessageComponentTypes,
} from 'discord-interactions';

export class Enemy {
    constructor(enemyID, enemyTier, enemyName, enemyMaxHealth, enemyDamage, enemyResistances) {
        this.enemyID = enemyID;
        this.enemyTier = enemyTier;
        this.enemyName = enemyName;
        this.enemyMaxHealth = enemyMaxHealth;
        this.enemyDamage = enemyDamage;
        this.enemyHealth = enemyMaxHealth;
        this.enemyResistances = enemyResistances;
    }

    getResistanceString() {
        return `🔥 ${this.enemyResistances[0]} | ⚡ ${this.enemyResistances[1]} | ❄️ ${this.enemyResistances[2]}`;
    }
    getDamageString() {
        return `🔥 ${this.enemyDamage[0]} | ⚡ ${this.enemyDamage[1]} | ❄️ ${this.enemyDamage[2]}`;
    }

    takeDamage(amount) {
        let [scorchDam, voltDam, freezeDam] = amount;
        let [scorchRes, voltRes, freezeRes] = this.enemyResistances;
        let totalDam = 0;
        totalDam += (scorchDam * (1 - (scorchRes / 100)));
        totalDam += (voltDam * (1 - (voltRes / 100)));
        totalDam += (freezeDam * (1 - (freezeRes / 100)));

        totalDam = Math.floor(totalDam);

        this.enemyHealth -= totalDam;

        console.log(`- ${this.enemyName} took ${totalDam} damage`);
    }

    showEnemy(userID, fightEnabled) {
        let componentList = [];

        if (fightEnabled) {
            componentList = [
                {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: `# ⚔️ ${this.enemyName}`,
                },
                {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: `Health: ${this.enemyMaxHealth}`,
                },
                {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: `Resistances: ${this.getResistanceString()}`,
                },
                {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: `Damage: ${this.getDamageString()}`,
                },
                {
                    type: MessageComponentTypes.ACTION_ROW,
                    components: [
                        {
                            type: MessageComponentTypes.BUTTON,
                            custom_id: `fight_button_${userID}_${this.enemyID}_${this.enemyTier}`,
                            label: 'Fight!',
                            style: ButtonStyleTypes.PRIMARY,
                        },
                    ]
                }
            ]
        }   
        else {
            componentList = [
                {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: `# ⚔️ ${this.enemyName}`,
                },
                {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: `Health: ${this.enemyMaxHealth}`,
                },
                {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: `Resistances: ${this.getResistanceString()}`,
                },
                {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: `Damage: ${this.getDamageString()}`,
                },
            ]
        }

        return componentList;
    }
}