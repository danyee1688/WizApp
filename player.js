import { SpellDB } from './spellDB.js';
import { Spell } from './spell.js';
import { Item } from './item.js';
import {
  ButtonStyleTypes,
  MessageComponentTypes,
} from 'discord-interactions';
import { chance } from './chance.js';

export class Player {
    constructor(userID, username) {
        this.userID = userID;
        this.username = username;
        this.maxHealth = 1000;
        this.health = this.maxHealth;
        this.spellList = [null, null, null];
        this.resistances = [0, 0, 0];
        this.attributes = [0, 0, 0];
        this.inventory = {
            staff: null,
            amulet: null,
            ring1: null,
            ring2: null,
            belt: null,
        };
        this.gold = 0;
        this.spellList[0] = SpellDB.getStartingSpell();
        this.increasedDamages = [0, 0, 0, 0, 0, 0];
        this.increasedCrits = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]];
        this.increasedHealingReceived = 0;
        this.dodgeChance = 0;
    }

    setDodgeChance(dodgeChance) {
        if (dodgeChance > 50) {
            this.dodgeChance = 50;
        }
        else {
            this.dodgeChance = dodgeChance;
        }
    }

    setResistances(scorchRes, voltRes, freezeRes) {
        if (scorchRes > 50) {
            scorchRes = 50;
        }

        if (voltRes > 50) {
            voltRes = 50;
        }

        if (freezeRes > 50) {
            freezeRes = 50
        }

        this.resistances = [scorchRes, voltRes, freezeRes];
    }

    getResistanceString() {
        return `🔥 ${this.resistances[0]} | ⚡ ${this.resistances[1]} | ❄️ ${this.resistances[2]}`;
    }

    getAttributesString() {
        return `🏃‍♂️ ${this.attributes[0]} | 💪 ${this.attributes[1]} | 🧠 ${this.attributes[2]}`;
    }

    revertToBase() {
        this.maxHealth = 1000;
        this.health = this.maxHealth;
        this.resistances = [0, 0, 0];
        this.attributes = [0, 0, 0];
        this.increasedDamages = [0, 0, 0, 0, 0, 0];
        this.increasedCrits = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]];
        this.increasedHealingReceived = 0;
        this.dodgeChance = 0;
    }

    takeDamage(amount) {
        let stringified = '';

        if (chance(this.dodgeChance) === true) {
            stringified = `- ${this.username} dodged`;
        }
        else {
            let [scorchDam, voltDam, freezeDam] = amount;
            let [scorchRes, voltRes, freezeRes] = this.resistances;
            let totalDam = 0
            totalDam += (scorchDam * (1 - (scorchRes / 100)));
            totalDam += (voltDam * (1 - (voltRes / 100)));
            totalDam += (freezeDam * (1 - (freezeRes / 100)));

            totalDam = Math.floor(totalDam);

            this.health -= totalDam;

            stringified = `- ${this.username} took ${totalDam} damage (${this.health}/${this.maxHealth})`;
        }

        console.log(stringified);

        return stringified;
    }

    heal(amount) {
        if (this.health + amount > this.maxHealth) {
            this.health = this.maxHealth;
        }
        else {
            this.health += amount;
        }
    }

    getRandomSpell() {
        let spellListTemp = this.spellList.filter(spell => spell != null);

        let randomIndex = Math.floor(Math.random() * spellListTemp.length);

        return spellListTemp[randomIndex];
    }

    getSpellName(index) {
        return this.spellList[index] ? this.spellList[index].spellName : "None";
    }
    
    learnSpell(index, spell) {
        console.log(`spell learnt: ${spell.spellName}`);
        this.spellList[index] = spell;
    }

    toJSON() {
        let JSON = {
            _id: this.userID,
            username: this.username,
            gold: this.gold,
            stats: {
                max_health: this.maxHealth,
                resistances: this.resistances,
                attributes: this.attributes,
            },
            spell_list: this.spellList.map(spell => spell ? spell.toJSON() : null),
            inventory: {
                staff: this.inventory.staff ? this.inventory.staff.toJSON() : null,
                amulet: this.inventory.amulet ? this.inventory.amulet.toJSON() : null,
                ring1: this.inventory.ring1 ? this.inventory.ring1.toJSON() : null,
                ring2: this.inventory.ring2 ? this.inventory.ring2.toJSON() : null,
                belt: this.inventory.belt ? this.inventory.belt.toJSON() : null
            },
        }
        // console.log("Player to JSON: ", JSON);
        return JSON;
    }

    static fromJSON(doc) {
        if (!doc) {
            return null;
        }

        // console.log("Player from JSON: ", doc);

        const player = new Player(doc._id, doc.username);
        player.maxHealth = doc.stats.max_health;
        player.gold = doc.gold;
        player.health = player.maxHealth;
        player.resistances = doc.stats.resistances;
        player.attributes = doc.stats.attributes;

        if (doc.spell_list) {
            player.spellList = doc.spell_list.map(
                spellData => spellData ? new Spell(spellData._id, spellData.tier, spellData.spell_name, spellData.base_damage, spellData.crit_chance, spellData.crit_damage, spellData.tags) : null
            );
        }

        if (doc.inventory) {
            player.inventory = {
                staff: doc.inventory.staff ? Item.fromJSON(doc.inventory.staff) : null,
                amulet: doc.inventory.amulet ? Item.fromJSON(doc.inventory.amulet) : null,
                ring1: doc.inventory.ring1 ? Item.fromJSON(doc.inventory.ring1) : null,
                ring2: doc.inventory.ring2 ? Item.fromJSON(doc.inventory.ring2) : null,
                belt: doc.inventory.belt ? Item.fromJSON(doc.inventory.belt): null
            }
        }

        return player;
    }

    // Return component list which shows player stats
    showPlayer(userID) {
        let componentList = [
            {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `# 🧙 ${this.username}`,
            },
            {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `-# Creator: <@${userID}>`,
            },
            {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `Health: ${this.health}/${this.maxHealth}`,
            },
            {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `Resistances: ${this.getResistanceString()}`,
            },
            {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `Attributes: ${this.getAttributesString()}`,
            },
            {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: "Spells: " + SpellDB.convertSpellListToString(this.spellList),
            },
            {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `Gold: ${this.gold}`,
            },
            {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                    {
                        type: MessageComponentTypes.BUTTON,
                        custom_id: `spells_${userID}`,
                        label: 'Spells',
                        style: ButtonStyleTypes.PRIMARY,
                    },
                    {
                        type: MessageComponentTypes.BUTTON,
                        custom_id: `inventory_${userID}`,
                        label: 'Inventory',
                        style: ButtonStyleTypes.PRIMARY,
                    },
                ]
            }
        ]

        return componentList;
    }

    // Returns component List which has stats for all spells in specified list
    showSpells() {
        let componentList = [];
        let spellListTemp = this.spellList.filter(spell => spell != null);
    
        componentList.push(
            {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `# ${this.username}'s Spell List`,
            }
        )

        for (let i = 0; i < spellListTemp.length; i++) {
            componentList = componentList.concat(spellListTemp[i].toComponent());

            if (i !== spellListTemp.length - 1) {
                componentList.push(
                    {
                        type: MessageComponentTypes.SEPARATOR,
                        divider: true,
                        spacing: 1,
                    }
                )
            }
            else {
                componentList.push(
                    {
                        type: MessageComponentTypes.ACTION_ROW,
                        components: [
                            {
                                type: MessageComponentTypes.BUTTON,
                                custom_id: `back_to_wizard_${this.userID}`,
                                label: 'Back',
                                style: ButtonStyleTypes.PRIMARY,
                            }
                        ]
                    }
                )
            }
        }

        return componentList;
    }

    equipItem(item) {
        switch (item.itemType) {
            case Item.ITEM_TYPE.Staff:
                this.inventory.staff = item;
                break;
            case Item.ITEM_TYPE.Amulet:
                this.inventory.amulet = item;
                break;
            case Item.ITEM_TYPE.Ring:
                this.inventory.ring1 = item;
                break;
            case Item.ITEM_TYPE.Belt:
                this.inventory.belt = item;
                break;
            default:
                break;
        }

        this.evaluateItems();
    }

    evaluateItems() {
        this.revertToBase();

        let stats = [];

        if (this.inventory.staff != null) {
            stats = stats.concat(this.inventory.staff.stats)
        }

        if (this.inventory.amulet != null) {
            stats = stats.concat(this.inventory.amulet.stats)
        }

        if (this.inventory.ring1 != null) {
            stats = stats.concat(this.inventory.ring1.stats)
        }

        if (this.inventory.belt != null) {
            stats = stats.concat(this.inventory.belt.stats)
        }

        this.applyStats(stats);

        this.health = this.maxHealth;
    }

    applyStats(stats) {
        let addedMaximumHealth = 0;
        let increasedMaximumHealth = 0;
        let addedScorchRes = 0;
        let addedVoltRes = 0;
        let addedFreezeRes = 0;
        let increasedScorchDam = 0;
        let increasedVoltDam = 0;
        let increasedFreezeDam = 0;
        let increasedProjectileDam = 0;
        let increasedAreaDam = 0;
        let increasedHealingReceived = 0;
        let addedDexterity = 0;
        let addedStrength = 0;
        let addedIntelligence = 0;
        let increasedCritChance = 0;
        let addedCritDamage = 0;
        let increasedScorchCritChance = 0;
        let addedScorchCritDamage = 0;
        let increasedVoltCritChance = 0;
        let addedVoltCritDamage = 0;
        let increasedFreezeCritChance = 0;
        let addedFreezeCritDamage = 0;
        let increasedProjectileCritChance = 0;
        let addedProjectileCritDamage = 0;
        let increasedAreaCritChance = 0;
        let addedAreaCritDamage = 0;

        stats.forEach((stat) => {
            switch (stat.statID) {
                case 0:
                    addedScorchRes += stat.value;
                    break;
                case 1:
                    addedVoltRes += stat.value;
                    break;
                case 2:
                    addedFreezeRes += stat.value;
                    break;
                case 3:
                    increasedScorchDam += stat.value;
                    break;
                case 4:
                    increasedVoltDam += stat.value;
                    break;
                case 5:
                    increasedFreezeDam += stat.value;
                    break;
                case 6:
                    increasedScorchDam += stat.value;
                    break;
                case 7:
                    increasedVoltDam += stat.value;
                    break;
                case 8:
                    increasedFreezeDam += stat.value;
                    break;
                case 9:
                    addedMaximumHealth += stat.value;
                    break;
                case 10:
                    increasedMaximumHealth += stat.value;
                    break;
                case 11:
                    addedDexterity += stat.value;
                    break;
                case 12:
                    addedStrength += stat.value;
                    break;
                case 13:
                    addedIntelligence += stat.value;
                    break;
                case 14:
                    increasedProjectileDam += stat.value;
                    break;
                case 15:
                    increasedAreaDam += stat.value;
                    break;
                case 16:
                    increasedHealingReceived += stat.value;
                    break;
                case 17:
                    increasedHealingReceived += stat.value;
                    break;
                case 18:
                    increasedCritChance += stat.value;
                    break;
                case 19:
                    increasedCritChance += stat.value;
                    break;
                case 20:
                    addedCritDamage += stat.value;
                    break;
                case 21:
                    addedCritDamage += stat.value;
                    break;
                case 22:
                    increasedScorchCritChance += stat.value;
                    break;
                case 23:
                    increasedVoltCritChance += stat.value;
                    break;
                case 24:
                    increasedFreezeCritChance += stat.value;
                    break;
                case 25:
                    increasedScorchCritChance += stat.value;
                    break;
                case 26:
                    increasedVoltCritChance += stat.value;
                    break;
                case 27:
                    increasedFreezeCritChance += stat.value;
                    break;
            }
        });

        this.attributes[0] += addedDexterity;
        this.attributes[1] += addedStrength;
        this.attributes[2] += addedIntelligence;

        // Calculate changes based on attributes
        // Dexterity bonus, +1% dodge chance per 5 dex
        this.setDodgeChance(this.dodgeChance + Math.floor(this.attributes[0] / 5));
        // Strength bonus, +1 max health per 2 strength
        addedMaximumHealth += Math.floor(this.attributes[1] / 2);
        // Intelligence bonus, +1% increased healing received per 4 intelligence
        increasedHealingReceived += Math.floor(this.attributes[2] / 4);

        this.maxHealth = (this.maxHealth + addedMaximumHealth) * (1 + Math.floor(increasedMaximumHealth / 100));
        this.setResistances(
            this.resistances[0] + addedScorchRes,
            this.resistances[1] + addedVoltRes,
            this.resistances[2] + addedFreezeRes,
        );
        this.increasedDamages[0] += increasedScorchDam;
        this.increasedDamages[1] += increasedVoltDam;
        this.increasedDamages[2] += increasedFreezeDam;
        this.increasedDamages[3] += increasedProjectileDam;
        this.increasedDamages[4] += increasedAreaDam;
        this.increasedHealingReceived += increasedHealingReceived;
        this.increasedCrits = [
            [increasedCritChance, addedCritDamage],
            [increasedScorchCritChance, addedScorchCritDamage],
            [increasedVoltCritChance, addedVoltCritDamage],
            [increasedFreezeCritChance, addedFreezeCritDamage],
            [increasedProjectileCritChance, addedProjectileCritDamage],
            [increasedAreaCritChance, addedAreaCritDamage],
        ];
    }

    showInventory() {
        let componentList = [
            {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `## 🧰 ${this.username}'s Inventory`
            }
        ];

        if (this.inventory.staff) {
            componentList = componentList.concat(this.inventory.staff.toComponent());
            componentList = componentList.concat(
                {
                    type: MessageComponentTypes.SEPARATOR,
                    spacing: 1,
                }
            );
        }

        if (this.inventory.amulet) {
            componentList = componentList.concat(this.inventory.amulet.toComponent());
            componentList = componentList.concat(
                {
                    type: MessageComponentTypes.SEPARATOR,
                    spacing: 1,
                }
            );
        }
        
        if (this.inventory.ring1) {
            componentList = componentList.concat(this.inventory.ring1.toComponent());
            componentList = componentList.concat(
                {
                    type: MessageComponentTypes.SEPARATOR,
                    spacing: 1,
                }
            );
        }
        
        if (this.inventory.ring2) {
            componentList = componentList.concat(this.inventory.ring2.toComponent());
            componentList = componentList.concat(
                {
                    type: MessageComponentTypes.SEPARATOR,
                    spacing: 1,
                }
            );
        }
        
        if (this.inventory.belt) {
            componentList = componentList.concat(this.inventory.belt.toComponent());
            componentList = componentList.concat(
                {
                    type: MessageComponentTypes.SEPARATOR,
                    spacing: 1,
                }
            );
        }

        return componentList;
    }
}
