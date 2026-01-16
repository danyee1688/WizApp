import { 
    weightedChoice,
    chance
} from "./chance.js";
import { 
    MessageComponentTypes,
    InteractionResponseFlags,
    InteractionResponseType,
    ButtonStyleTypes
 } from "discord-interactions";
import { Item } from "./item.js";
import { SpellDB } from "./spellDB.js";
import { Spell } from "./spell.js";

export class LootManager {
    static activeLoot = new Map();

    static addLoot(itemID, item) {
        this.activeLoot.set(itemID, item);
    }

    static removeLoot(itemID) {
        this.activeLoot.delete(itemID);
    }

    static hasLoot(itemID) {
        return this.activeLoot.has(itemID);
    }

    // Amount of loop to drop
    static numLootList = [
        1,
        2,
        3
    ]

    // Weights for amount of loop to drop
    // Based on enemy tier or if it originates from the shop
    static numLootWeights = {
        0: [80, 17, 3],
        1: [30, 60, 10],
        2: [3, 17, 80],
        'shop': [60, 30, 10],
    }

    static enemyLootDropChances = {
        0: 10,
        1: 25,
        2: 100,
    }

    static getLootEnemy(enemyTier) {
        let lootList = [];
        const percentage = this.enemyLootDropChances[enemyTier];
        const result = chance(percentage);

        console.log(`chance to drop loot ${percentage}%: ${result}`);

        if (result === true) {
            const numLoot = weightedChoice(this.numLootList, this.numLootWeights[enemyTier]);

            for (let i = 0; i < numLoot; i++) {
                // 95% chance to drop an item
                if (chance(95)) {
                    let item = new Item()
                    lootList.push(item);
                    this.addLoot(item.internalID, item);
                }
                // 5% chance to drop a spell scroll
                else {
                    lootList.push(SpellDB.getRandomSpell());
                }
            }
        }
        else {
            console.log("get loot failed chance");
        }
        
        return lootList;
    }

    // Get list of loot items
    // Enemy tier is 'shop' if purchased from shop
    static getLootShop() {
        const numLoot = weightedChoice(this.numLootList, this.numLootWeights["shop"]);
        let lootList = [];

        for (let i = 0; i < numLoot; i++) {
            // 90% chance to drop an item
            if (chance(90)) {
                let item = new Item()
                lootList.push(item);
                this.addLoot(item.internalID, item);
            }
            // 10% chance to drop a spell scroll
            else {
                lootList.push(SpellDB.getRandomSpell());
            }
        }

        return lootList;
    }

    static lootToComponent(loot, userID) {
        if (loot.internalType === "item") {
            const itemComponent = loot.toComponent();
            const color = loot.rarityToColor();
            const buttonComponent = [
                {
                    type: MessageComponentTypes.ACTION_ROW,
                    components: [
                    {
                        type: MessageComponentTypes.BUTTON,
                        label: "Take and equip",
                        custom_id: `take_loot_${userID}_${loot.internalID}`,
                        style: ButtonStyleTypes.PRIMARY,
                    },
                    {
                        type: MessageComponentTypes.BUTTON,
                        label: "Dismiss",
                        custom_id: `dismiss_message_${userID}_${loot.internalID}`,
                        style: ButtonStyleTypes.SECONDARY,
                    }
                    ]
                }
            ];

            const container = {
                flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                components: [
                    {
                        type: MessageComponentTypes.CONTAINER,
                        accent_color: color,
                        components: [
                            {
                                type: MessageComponentTypes.TEXT_DISPLAY,
                                content: `## 💎 <@${userID}>'s Loot`
                            },
                        ].concat(itemComponent).concat(buttonComponent)
                    }
                ]
            }

            return container;
        }
        else if (loot.internalType === "spell") {
            const spellComponent = loot.toComponent();
            const color = 0xFFFFFF;
            const buttonComponent = [
                {
                    type: MessageComponentTypes.ACTION_ROW,
                    components: [
                        {
                            type: MessageComponentTypes.BUTTON,
                            label: "Learn Spell",
                            custom_id: `learn_spell_${userID}_${loot.spellID}_${loot.tier - 1}`, // Convert to zero based
                            style: ButtonStyleTypes.PRIMARY,
                        },
                        {
                            type: MessageComponentTypes.BUTTON,
                            label: "Dismiss",
                            custom_id: `dismiss_message_${userID}_0`,
                            style: ButtonStyleTypes.SECONDARY,
                        }
                    ]
                }
            ];

            const container = {
                flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                components: [
                    {
                        type: MessageComponentTypes.CONTAINER,
                        accent_color: color,
                        components: [
                            {
                                type: MessageComponentTypes.TEXT_DISPLAY,
                                content: `## 💎 <@${userID}>'s Loot`
                            },
                            {
                                type: MessageComponentTypes.TEXT_DISPLAY,
                                content: 'You have found a spell scroll!',
                            },
                        ].concat(spellComponent).concat(buttonComponent)
                    }
                ]
            }

            return container;
        }
        else {
            return null;
        }
    }
}