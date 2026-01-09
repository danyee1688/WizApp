import 'dotenv/config';
import express from 'express';
import {
  ButtonStyleTypes,
  InteractionResponseFlags,
  InteractionResponseType,
  InteractionType,
  MessageComponentTypes,
  TextStyleTypes,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { DiscordRequest } from './utils.js';
import { 
  connectToDB,
  loadPlayer, 
  savePlayer,
  hasPlayer,
} from './playerManager.js';
import { Player } from './player.js';
import { SpellDB } from './spellDB.js';
import { 
  battle,
  duel
} from './combat.js';
import { EnemyDB } from './enemyDB.js';
import { Item } from './item.js';
import { LootManager } from './lootManager.js';
import { randomUUID } from "crypto";
import { chance } from './chance.js';
import { WikiDB } from './wikiDB.js';
import { Arena } from './arena.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
let activeArenas = {};

await connectToDB();

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  // Interaction id, type and data
  const { id, type, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" command
    if (name === 'test') {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.IS_COMPONENTS_V2,
          components: [
            {
              type: MessageComponentTypes.TEXT_DISPLAY,
              content: `Hello Wizardry World!`
            }
          ]
        },
      });
    }

    // "start" command
    if (name === 'start') {
      const context = req.body.context;
      const userID = context === 0 ? req.body.member.user.id : req.body.user.id;
      let playerExists = await hasPlayer(`${userID}`);

      if (playerExists === true) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [
              {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: "You already have a wizard! View your wizard with /wizard.",
              },
            ]
          }
        });
      }
      else {
        return res.send({
          type: InteractionResponseType.MODAL,
          data: {
            custom_id: `wizard_creation_${userID}`,
            title: 'Wizard Creation',
            components: [
              {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `Welcome to the world of wizardry! To get started, please enter the name for your wizard.`,
              },
              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.INPUT_TEXT,
                    custom_id: `wizard_name${userID}`,
                    style: TextStyleTypes.SHORT,
                    label: 'Name',
                    placeholder: 'Bob, the Herald of Doom',
                  },
                ],
              },
            ]
          }
        });
      }
    }

    if (name === 'arena' && id) {
      const context = req.body.context;
      const userID = context === 0 ? req.body.member.user.id : req.body.user.id;
      const arenaID = randomUUID();

      activeArenas[arenaID] = [];

      console.log('active arenas: ')
      console.log(activeArenas);

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.IS_COMPONENTS_V2,
          components: [
            {
              type: MessageComponentTypes.CONTAINER,
              accent_color: 0xFFFFFF,
              components: [
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content: '# 🏟️ Arena'
                },
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content: `A Wizardry Arena has opened! All are welcome.`,
                },
                {
                  type: MessageComponentTypes.ACTION_ROW,
                  components: [
                    {
                      type: MessageComponentTypes.BUTTON,
                      custom_id: `join_button_${arenaID}`,
                      label: 'Join',
                      style: ButtonStyleTypes.PRIMARY,
                    },
                    {
                      type: MessageComponentTypes.BUTTON,
                      custom_id: `start_button_${arenaID}`,
                      label: 'Start',
                      style: ButtonStyleTypes.PRIMARY,
                    },
                  ]
                }
              ]
            }
          ]
        }
      });
    }

    if (name === 'wizard') {
      const context = req.body.context;
      let userID = req.body.data.options ? req.body.data.options[0].value : null;

      if (!userID) {
        userID = context === 0 ? req.body.member.user.id : req.body.user.id;
      }

      let playerExists = await hasPlayer(userID);
      if (playerExists === true) {
        let player = await loadPlayer(userID);
        let componentList = player.showPlayer(userID);

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [
              {
                type: MessageComponentTypes.CONTAINER,
                accent_color: 108000,
                components: componentList,
              }
            ]
          }
        });
      }
      else {
        return getWizardMissingResponse(res);
      }
    }

    if (name == 'adventure') {
      const context = req.body.context;
      const userID = context === 0 ? req.body.member.user.id : req.body.user.id;
      let playerExists = await hasPlayer(userID);
      if (playerExists === true) {
        let enemy = EnemyDB.getRandomEnemy();
        let componentList = enemy.showEnemy(userID, true);
        const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/@original`;

        setTimeout(async () => {
          try {
            await DiscordRequest(endpoint, {
              method: 'DELETE',
            });
          } catch (err) {
            console.error("Timeout error: " + err);
          }
        }, 30_000);

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [
              {
                type: MessageComponentTypes.CONTAINER,
                accent_color: 0xFF0000,
                components: componentList,
              }
            ]
          }
        });
      }
      else {
        return getWizardMissingResponse(res);
      }
    }

    if (name === "shop") {
      const context = req.body.context;
      const userID = context === 0 ? req.body.member.user.id : req.body.user.id;
      let playerExists = await hasPlayer(userID);
      if (playerExists === true) {
        let player = await loadPlayer(userID);

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [
              {
                type: MessageComponentTypes.CONTAINER,
                accent_color: 0xFFFF00,
                components: [
                  {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: `# 💰 Shop`
                  },
                  {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: `Purchase loot crates here! Each loot crate costs 500 gold.`
                  },
                  {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: `${player.username} currently has ${player.gold} gold.`
                  },
                  {
                    type: MessageComponentTypes.ACTION_ROW,
                    components: [
                      {
                        type: MessageComponentTypes.BUTTON,
                        style: ButtonStyleTypes.PRIMARY,
                        custom_id: `purchase_loot_${userID}`,
                        label: "Purchase Loot Crate",
                      },
                      {
                        type: MessageComponentTypes.BUTTON,
                        style: ButtonStyleTypes.SECONDARY,
                        custom_id: `close_shop_${userID}`,
                        label: "Close Shop",
                      },
                    ]
                  },
                ]
              }
            ]
          }
        });
      }
      else {
        return getWizardMissingResponse(res);
      }
    }

    if (name === "duel") {
      const context = req.body.context;
      const opponentUserID = req.body.data.options[0].value;
      const userID = context === 0 ? req.body.member.user.id : req.body.user.id;
      let playerExists = await hasPlayer(userID) && await hasPlayer(opponentUserID);

      if (playerExists === true) {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [
              {
                type: MessageComponentTypes.CONTAINER,
                accent_color: 0xFF0000,
                components: [
                  {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: '## 🔥 Duel'
                  },
                  {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: `<@${userID}> has challenged <@${opponentUserID}> to a duel! Do they accept the request?`
                  },
                  {
                    type: MessageComponentTypes.ACTION_ROW,
                    components: [
                      {
                        type: MessageComponentTypes.BUTTON,
                        style: ButtonStyleTypes.PRIMARY,
                        label: 'Accept',
                        custom_id: `accept_duel_${userID}_${opponentUserID}`
                      }
                    ]
                  }
                ]
              }
            ]
          }
        });
      }
      else {
        return getWizardMissingResponse(res);
      }
    }

    if (name === 'wiki') {
      const context = req.body.context;
      const entry = req.body.data.options[0].value;
      const userID = context === 0 ? req.body.member.user.id : req.body.user.id;

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          flags: InteractionResponseFlags.IS_COMPONENTS_V2,
          accent_color: 0x101010,
          components: [
            {
              type: MessageComponentTypes.CONTAINER,
              components: [
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content: `### ${WikiDB.wikiEntries[entry].title}`,
                },
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content: WikiDB.wikiEntries[entry].entry,
                }
              ]
            }
          ]
        }
      });
    }

    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });
  }

  // Message component response handling
  if (type === InteractionType.MESSAGE_COMPONENT) {
    const componentID = data.custom_id;

    if (componentID.startsWith('join_button_')) {
      const context = req.body.context;
      const userID = context === 0 ? req.body.member.user.id : req.body.user.id;
      const arenaID = componentID.split('_')[2];
      const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;

      let playerExists = await hasPlayer(userID);
      if (playerExists === true) {
        try {
          if (activeArenas[arenaID].includes(userID)) {
            console.log(`User ${userID} already in arena.`);
            try {
              await res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
                  components: [
                    {
                      type: MessageComponentTypes.TEXT_DISPLAY,
                      content: "You have already joined this Arena!",
                    },
                  ]
                }
              });
            } catch (err) {
              console.error('Error sending message', err);
            }
          }
          else {
            activeArenas[arenaID].push(userID);

            try {
              await res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                  components: [
                    {
                      type: MessageComponentTypes.TEXT_DISPLAY,
                      content: `<@${userID}> has joined the fight! Good luck, you'll need it.`,
                    }
                  ]
                }
              });

              await DiscordRequest(endpoint, {
                method: 'PATCH',
                body: {
                  flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                  components: [
                    {
                      type: MessageComponentTypes.CONTAINER,
                      accent_color: 0xFFFFFF,
                      components: [
                        {
                          type: MessageComponentTypes.TEXT_DISPLAY,
                          content: '# 🏟️ Arena'
                        },
                        {
                          type: MessageComponentTypes.TEXT_DISPLAY,
                          content: `A Wizardry Arena has opened! All are welcome. ${activeArenas[arenaID].length} ready to spar.`,
                        },
                        {
                          type: MessageComponentTypes.ACTION_ROW,
                          components: [
                            {
                              type: MessageComponentTypes.BUTTON,
                              custom_id: `join_button_${arenaID}`,
                              label: 'Join',
                              style: ButtonStyleTypes.PRIMARY,
                            },
                            {
                              type: MessageComponentTypes.BUTTON,
                              custom_id: `start_button_${arenaID}`,
                              label: 'Start',
                              style: ButtonStyleTypes.PRIMARY,
                            },
                          ]
                        }
                      ]
                    }
                  ]
                }
              });
            } catch (err) {
              console.error('Error sending message', err);
            }
          }
        } catch (err) {
          console.error('Arena join error: ', err);
        }
      }
      else {
        try {
          await getWizardMissingResponse(res);
        } catch (err) {
          console.error('Error sending message', err);
        }
      }
    }
    else if (componentID.startsWith('start_button_')) {
      const arenaID = componentID.split('_')[2];
      const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/@original`;

      try {
        if (activeArenas[arenaID].length <= 1) {
          try {
            await res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
                components: [
                  {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: `Cannot start the arena with ${activeArenas[arenaID].length} wizard(s)`,
                  }
                ]
              }
            });
          } catch (err) {
            console.error('Error sending message', err);
          }
        }
        else {
          const followUpEndpoint = `webhooks/${process.env.APP_ID}/${req.body.token}`;

          try {
            await res.send({
              type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
            });

            await DiscordRequest(endpoint, {
              method: 'PATCH',
              body: {
                flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                components: [
                  {
                    type: MessageComponentTypes.CONTAINER,
                    accent_color: 0xFFFFFF,
                    components: [
                      {
                        type: MessageComponentTypes.TEXT_DISPLAY,
                        content: '# 🏟️ Arena'
                      },
                      {
                        type: MessageComponentTypes.TEXT_DISPLAY,
                        content: 'The arena begins!\nEach wizard has their health reduced to 1/4th of their maximum health.\nGood luck wizards!',
                      }
                    ]
                  }
                ]
              }
            })

            let arena = new Arena(activeArenas[arenaID]);
            let messages = await arena.startArena();

            for (let i = 0; i < messages.length; i++) {
              setTimeout(async () => {
                let componentList = [];

                if (messages[i].includes("perished")){
                  componentList = [
                    {
                      type: MessageComponentTypes.CONTAINER,
                      accent_color: 0xFF0000,
                      components: [
                        {
                          type: MessageComponentTypes.TEXT_DISPLAY,
                          content: messages[i],
                        }
                      ]
                    }
                  ];
                }
                else if (i === messages.length - 1) {
                  componentList = [
                    {
                      type: MessageComponentTypes.CONTAINER,
                      accent_color: 0x00FF00,
                      components: [
                        {
                          type: MessageComponentTypes.TEXT_DISPLAY,
                          content: '## 🎊 Arena Results'
                        },
                        {
                          type: MessageComponentTypes.TEXT_DISPLAY,
                          content: messages[i],
                        },
                        {
                          type: MessageComponentTypes.SEPARATOR,
                          spacing: 1,
                        },
                        {
                          type: MessageComponentTypes.TEXT_DISPLAY,
                          content: '-# Start another arena with /arena!'
                        }
                      ]
                    }
                  ];
                }
                else {
                  componentList = [
                    {
                      type: MessageComponentTypes.CONTAINER,
                      accent_color: 0xFFFFFF,
                      components: [
                        {
                          type: MessageComponentTypes.TEXT_DISPLAY,
                          content: messages[i],
                        }
                      ]
                    }
                  ];
                }

                try {
                  await DiscordRequest(followUpEndpoint, {
                    method: 'POST',
                    body: {
                      flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                      components: componentList,
                    }
                  });
                } catch (err) {
                  console.error("Timeout error: " + err);
                }
              }, i * 2500);
            }

            delete activeArenas[arenaID];
          } catch (err) {
            console.error('Error sending message', err);
          }
        }
      } catch (err) {
        console.error('Arena start error: ', err);
      }
    }
    else if (componentID.startsWith('spells_')) {
      const context = req.body.context;
      const userID = componentID.split('_')[1];
      const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;

      let player = await loadPlayer(userID);
      let componentList = player.showSpells();

      try {
        await res.send({
          type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE
        });

        await DiscordRequest(endpoint, {
          method: 'PATCH',
          body: {
            flags: InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [
              {
                type: MessageComponentTypes.CONTAINER,
                accent_color: 108000,
                components: componentList,
              },
            ]
          }
        });
      } catch (err) {
        console.error(`Error sending message: `, err);
      }
    }
    else if (componentID.startsWith('back_to_wizard_')) {
      const context = req.body.context;
      const userID = componentID.split('_')[3];
      const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;

      let playerExists = await hasPlayer(userID);
      if (playerExists === true) {
        let player = await loadPlayer(userID);
        let componentList = player.showPlayer(userID);

        try {
          await res.send({
            type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE
          });

          await DiscordRequest(endpoint, {
            method: 'PATCH',
            body: {
              flags: InteractionResponseFlags.IS_COMPONENTS_V2,
              components: [
                {
                  type: MessageComponentTypes.CONTAINER,
                  accent_color: 108000,
                  components: componentList,
                }
              ]
            }
          });
        } catch (err) {
          console.error(`Error sending message: `, err);
        }
      }
    }
    else if (componentID.startsWith('fight_button_')) {
      const context = req.body.context;
      const userID = context === 0 ? req.body.member.user.id : req.body.user.id;
      const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;

      // Find if player exists in MongoDB
      let playerExists = await hasPlayer(userID);
      if (playerExists === true) {
        // Parse enemy stats from component ID
        const enemyStats = componentID.split('_');
        const enemyID = enemyStats[3];
        const enemyTier = enemyStats[4];
        const enemy = EnemyDB.findEnemyByID(enemyTier, enemyID);

        // Load player
        const player = await loadPlayer(userID);

        // Start battle and get results
        let results = await battle(player, enemy);
        await savePlayer(player);
        let color = 0x000000;

        if (results.victory === true) {
          color = 0x00FF00;
        }
        else {
          color = 0xFF0000;
        }

        // Show results
        console.log(results);

        try {
          // Show message based on win condition
          if (results.victory === true) {
            await res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                  components: [
                    {
                      type: MessageComponentTypes.CONTAINER,
                      accent_color: color,
                      components: [
                        {
                          type: MessageComponentTypes.TEXT_DISPLAY,
                          content: `## 🎉 Combat Results`,
                        },
                        {
                          type: MessageComponentTypes.TEXT_DISPLAY,
                          content: `### <@${userID}> VS ${enemy.enemyName}`,
                        },
                        {
                          type: MessageComponentTypes.SEPARATOR,
                          spacing: 1
                        },
                        {
                          type: MessageComponentTypes.TEXT_DISPLAY,
                          content: `${enemy.enemyName} (${enemy.enemyHealth} HP/${enemy.enemyMaxHealth} HP) was slain by ${player.username} (${player.health} HP/${player.maxHealth} HP)`,
                        },
                        {
                          type: MessageComponentTypes.SEPARATOR,
                          spacing: 1
                        },
                        {
                          type: MessageComponentTypes.TEXT_DISPLAY,
                          content: `${enemy.enemyName} dropped ${results.goldGained} gold`,
                        },
                      ]
                    }
                  ]
                }
            });
          }
          // If loss
          else {
            await res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                  components: [
                    {
                      type: MessageComponentTypes.CONTAINER,
                      accent_color: color,
                      components: [
                        {
                          type: MessageComponentTypes.TEXT_DISPLAY,
                          content: `## 💀 Combat Results`,
                        },
                        {
                          type: MessageComponentTypes.TEXT_DISPLAY,
                          content: `### <@${userID}> VS ${enemy.enemyName}`,
                        },
                        {
                          type: MessageComponentTypes.SEPARATOR,
                          spacing: 1
                        },
                        {
                          type: MessageComponentTypes.TEXT_DISPLAY,
                          content: `${player.username} (${player.health} HP/${player.maxHealth} HP) was slain by ${enemy.enemyName} (${enemy.enemyHealth} HP/${enemy.enemyMaxHealth} HP)`,
                        },
                      ]
                    }
                  ]
                }
            });
          }

          // Delete original message after combat finished
          await DiscordRequest(endpoint, {
            method: 'DELETE',
          });
        } catch (err) {
          console.error(`Error sending message: `, err);
        }
      }
      else {
        try {
          await getWizardMissingResponse(res);
        } catch (err) {
          console.error(`Error sending message: `, err);
        }
      }
    }
    else if (componentID.startsWith("purchase_loot_")) {
      const context = req.body.context;
      const userID = context === 0 ? req.body.member.user.id : req.body.user.id;
      const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/@original`;
      const shopEndpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;
      const playerExists = await hasPlayer(userID);
      if (playerExists === true) {
        const player = await loadPlayer(userID);

        try {
          // Check if player has enough gold
          if (player.gold >= 500) {
            player.gold -= 500; 
            await savePlayer(player);
            let componentList = [];
            let color = 0x000000;
            let success = false;

            // 90% chance to get an item, 
            // 10% chance to learn a new spell
            if (chance(90) === true) {
              // Generate new item
              const item = new Item();
              const itemID = randomUUID();
              LootManager.addLoot(itemID, item);
              const itemComponents = item.toComponent();
              color = item.rarityToColor();
              const buttonComponent = [
                {
                  type: MessageComponentTypes.ACTION_ROW,
                  components: [
                    {
                    type: MessageComponentTypes.BUTTON,
                    label: "Take and equip",
                    custom_id: `take_loot_${userID}_${itemID}`,
                    style: ButtonStyleTypes.PRIMARY,
                    }
                  ]
                }
              ];
              componentList = [
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content: `## 💎 <@${userID}>'s Loot`
                },
              ].concat(itemComponents).concat(buttonComponent);

              success = true;

              setTimeout(async () => {
                try {
                  await DiscordRequest(endpoint, {
                    method: 'DELETE',
                  });

                  LootManager.removeLoot(itemID);
                } catch (err) {
                  console.error("Timeout error: " + err);
                }
              }, 30_000);
            }
            else {
              // Learn a new spell
              const spell = SpellDB.getRandomSpell(player.spellList);
              color = 0xFFFFFF;

              // If spell is not null
              if (spell) {
                success = true;

                const buttonComponent = [
                  {
                    type: MessageComponentTypes.ACTION_ROW,
                    components: [
                      {
                        type: MessageComponentTypes.BUTTON,
                        label: "Learn Spell",
                        custom_id: `learn_spell_${userID}_${spell.spellID}`,
                        style: ButtonStyleTypes.PRIMARY,
                      }
                    ]
                  }
                ];

                componentList = [
                  {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: `## 💎 <@${userID}>'s Loot`
                  },
                  {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: 'You have found a spell scroll!',
                  },
                ].concat(spell.toComponent()).concat(buttonComponent);

                setTimeout(async () => {
                  try {
                    await DiscordRequest(endpoint, {
                      method: 'DELETE',
                    });

                    LootManager.removeLoot(itemID);
                  } catch (err) {
                    console.error("Timeout error: " + err);
                  }
                }, 30_000);
              }
            }
            
            // If nothing went wrong, continue with sending the appropiate message
            if (success = true) {
              await res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                  components: [
                    {
                      type: MessageComponentTypes.CONTAINER,
                      accent_color: color,
                      components: componentList,
                    }
                  ]
                }
              });

              await DiscordRequest(shopEndpoint, {
                method: "PATCH",
                body: {
                  flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                  components: [
                    {
                      type: MessageComponentTypes.CONTAINER,
                      accent_color: 0xFFFF00,
                      components: [
                        {
                          type: MessageComponentTypes.TEXT_DISPLAY,
                          content: `# 💰 Shop`
                        },
                        {
                          type: MessageComponentTypes.TEXT_DISPLAY,
                          content: `Purchase loot crates here! Each loot crate costs 500 gold.`
                        },
                        {
                          type: MessageComponentTypes.TEXT_DISPLAY,
                          content: `${player.username} currently has ${player.gold} gold.`
                        },
                        {
                          type: MessageComponentTypes.ACTION_ROW,
                          components: [
                            {
                              type: MessageComponentTypes.BUTTON,
                              style: ButtonStyleTypes.PRIMARY,
                              custom_id: `purchase_loot_${userID}`,
                              label: "Purchase Loot Crate",
                            },
                            {
                              type: MessageComponentTypes.BUTTON,
                              style: ButtonStyleTypes.SECONDARY,
                              custom_id: `close_shop_${userID}`,
                              label: "Close Shop",
                            },
                          ]
                        },
                      ]
                    }
                  ]
                }
              });
            }
            // Spell learning error (should theoretically never be possible)
            else {
              player.gold += 500;
              await savePlayer(player);

              await res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                  flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
                  components: [
                    {
                      type: MessageComponentTypes.TEXT_DISPLAY,
                      content: 'You have dropped a spell scroll, but you have already learnt all possible spells! Your gold has been refunded'
                    }
                  ]
                }
              });
            }
          }
          // Not enough gold
          else {
            await res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
                components: [
                  {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: `You do not have enough gold, unfortunately. Time to go adventuring!`
                  },
                ]
              }
            });
          }
        } catch (err) {
          console.error('Error sending message: ', err);
        }
      } 
      else {
        try {
          await getWizardMissingResponse(res);
        } catch (err) {
          console.error('Error sending message: ', err);
        }
      }
    }
    else if (componentID.startsWith("close_shop_")) {
      const context = req.body.context;
      const userID = context === 0 ? req.body.member.user.id : req.body.user.id;
      const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;

      try {
        await res.send({
          type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE
        });

        await DiscordRequest(endpoint, {
          method: 'DELETE',
        });
      } catch (err) {
        console.error(`Error sending message: `, err);
      }
    }
    else if (componentID.startsWith("take_loot_")) {
      const context = req.body.context;
      const userID = context === 0 ? req.body.member.user.id : req.body.user.id;
      const lootUserID = componentID.split('_')[2];
      const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;
      const itemID = componentID.split('_')[3];
      const item = LootManager.activeLoot.get(itemID);
      LootManager.removeLoot(itemID);

      console.log("itemID: " + itemID);

      // Check if user pressing button is the same as the one who dropped the loot
      if (userID === lootUserID) {
        const playerExists = await hasPlayer(userID);
        if (playerExists === true) {
          const player = await loadPlayer(userID);

          player.equipItem(item);
          await savePlayer(player);

          // Delete loot message 
          try {
            await res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
                components: [
                  {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: `${player.username} has equipped ${item.itemName}, ${item.rarityToString()} ${item.typeToString()}!`
                  }
                ]
              }
            });

            await DiscordRequest(endpoint, {
              method: 'DELETE',
            });
          } catch (err) {
            console.error("Error sending response: ", err);
          }
        }
        else {
          try {
            await getWizardMissingResponse(res);
          } catch (err) {
            console.error("Error sending response: ", err);
          }
        }
      }
      else {
        await res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [
              {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `This is not your loot! What are ya, a loot goblin??`
              },
            ]
          }
        });
      }
    }
    else if (componentID.startsWith('inventory_')) {
      const context = req.body.context;
      const userID = componentID.split('_')[1];
      const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;

      let player = await loadPlayer(userID);
      let componentList = player.showInventory().concat([
        {
            type: MessageComponentTypes.ACTION_ROW,
            components: [
                {
                    type: MessageComponentTypes.BUTTON,
                    custom_id: `back_to_wizard_${userID}`,
                    label: 'Back',
                    style: ButtonStyleTypes.PRIMARY,
                }
            ]
        }
      ]);

      try {
        await res.send({
          type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE
        });

        await DiscordRequest(endpoint, {
          method: 'PATCH',
          body: {
            flags: InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [
              {
                type: MessageComponentTypes.CONTAINER,
                accent_color: 108000,
                components: componentList,
              },
            ]
          }
        });
      } catch (err) {
        console.error(`Error sending message: `, err);
      }
    }
    else if (componentID.startsWith('learn_spell_')) {
      const context = req.body.context;
      const userID = componentID.split('_')[2];
      const lootUserID = context === 0 ? req.body.member.user.id : req.body.user.id;
      const spellID = componentID.split('_')[3];
      const spell = SpellDB.spellList[spellID];
      const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;

      // Check if user pressing button is the same as the one who dropped the loot
      if (userID === lootUserID) {
        const playerExists = await hasPlayer(userID);
        if (playerExists === true) {
          const player = await loadPlayer(userID);

          // Delete loot message and show spell equip menu
          try {
            await res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
                components: [
                  {
                    type: MessageComponentTypes.CONTAINER,
                    accent_color: 0xFFFFFF,
                    components: [
                      {
                        type: MessageComponentTypes.TEXT_DISPLAY,
                        content: '### Spell Slot Management',
                      },
                      {
                        type: MessageComponentTypes.TEXT_DISPLAY,
                        content: `Please choose the slot you want ${spell.spellName} to take`,
                      },
                      {
                        type: MessageComponentTypes.ACTION_ROW,
                        components: [
                          {
                            type: MessageComponentTypes.BUTTON,
                            style: ButtonStyleTypes.SECONDARY,
                            label: `1 - ${player.getSpellName(0)}`,
                            custom_id: `equip_spell_1_${spellID}`
                          },
                          {
                            type: MessageComponentTypes.BUTTON,
                            style: ButtonStyleTypes.SECONDARY,
                            label: `2 - ${player.getSpellName(1)}`,
                            custom_id: `equip_spell_2_${spellID}`
                          },
                          {
                            type: MessageComponentTypes.BUTTON,
                            style: ButtonStyleTypes.SECONDARY,
                            label: `3 - ${player.getSpellName(2)}`,
                            custom_id: `equip_spell_3_${spellID}`
                          },
                        ]
                      }
                    ]
                  }
                ]
              }
            });

            await DiscordRequest(endpoint, {
              method: 'DELETE',
            });
          } catch (err) {
            console.error("Error sending response: ", err);
          }
        }
        else {
          try {
            await getWizardMissingResponse(res);
          } catch (err) {
            console.error("Error sending response: ", err);
          }
        }
      }
      else {
        await res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [
              {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `This is not your loot! What are ya, a loot goblin??`
              },
            ]
          }
        });
      }
    }
    else if (componentID.startsWith('equip_spell_')) {
      const context = req.body.context;
      const userID = context === 0 ? req.body.member.user.id : req.body.user.id;
      const spellSlot = componentID.split('_')[2];
      const spellID = componentID.split('_')[3];
      const spell = SpellDB.spellList[spellID];
      const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/@original`;

      const playerExists = await hasPlayer(userID);
      if (playerExists === true) {
        const player = await loadPlayer(userID);

        player.learnSpell(spellSlot, spell);
        savePlayer(player);

        try {
          await res.send({
            type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
          });

          await DiscordRequest(endpoint, {
            method: 'PATCH',
            body: {
              flags: InteractionResponseFlags.IS_COMPONENTS_V2,
              components: [
                {
                  type: MessageComponentTypes.CONTAINER,
                  accent_color: 0xFFFFFF,
                  components: [
                    {
                      type: MessageComponentTypes.TEXT_DISPLAY,
                      content: '### Spell Slot Management',
                    },
                    {
                      type: MessageComponentTypes.TEXT_DISPLAY,
                      content: `${spell.spellName} has been slot into position ${spellSlot}!`,
                    },
                  ]
                },
              ]
            }
          });
        } catch (err) {
          console.error("Error sending response: ", err);
        }
      }
      else {
        try {
          await getWizardMissingResponse(res);
        } catch (err) {
          console.error("Error sending response: ", err);
        }
      }
    }
    else if (componentID.startsWith('accept_duel_')) {
      const context = req.body.context;
      const opponentUserID = componentID.split('_')[3];
      const userID = componentID.split('_')[2];
      const actionUserID = context === 0 ? req.body.member.user.id : req.body.user.id;
      const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;

      if (actionUserID === opponentUserID) {
        let playerExists = await hasPlayer(userID) && await hasPlayer(opponentUserID);

        if (playerExists === true) {
          let player = await loadPlayer(userID);
          let opponent = await loadPlayer(opponentUserID);
          // Start battle and get results
          let results = await duel(player, opponent);
          let color = 0x000000;

          if (results.victory === true) {
            color = 0x00FF00;
          }
          else if(results.victory === false) {
            color = 0xFF0000;
          }

          // Show results
          console.log(results);

          try {
            // Show message based on win condition
            if (results.victory === true) {
              await res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                  data: {
                    flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                    components: [
                      {
                        type: MessageComponentTypes.CONTAINER,
                        accent_color: color,
                        components: [
                          {
                            type: MessageComponentTypes.TEXT_DISPLAY,
                            content: `## 🎉 Combat Results`,
                          },
                          {
                            type: MessageComponentTypes.TEXT_DISPLAY,
                            content: `### <@${userID}> VS <@${opponentUserID}>`,
                          },
                          {
                            type: MessageComponentTypes.SEPARATOR,
                            spacing: 1
                          },
                          {
                            type: MessageComponentTypes.TEXT_DISPLAY,
                            content: `${opponent.username} (${opponent.health} HP/${opponent.maxHealth} HP) was slain by ${player.username} (${player.health} HP/${player.maxHealth} HP)`,
                          },
                        ]
                      }
                    ]
                  }
              });
            }
            // If loss
            else if (results.victory === false) {
              await res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                  data: {
                    flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                    components: [
                      {
                        type: MessageComponentTypes.CONTAINER,
                        accent_color: color,
                        components: [
                          {
                            type: MessageComponentTypes.TEXT_DISPLAY,
                            content: `## 💀 Combat Results`,
                          },
                          {
                            type: MessageComponentTypes.TEXT_DISPLAY,
                            content: `### <@${opponentUserID}> VS <@${userID}>`,
                          },
                          {
                            type: MessageComponentTypes.SEPARATOR,
                            spacing: 1
                          },
                          {
                            type: MessageComponentTypes.TEXT_DISPLAY,
                            content: `${player.username} (${player.health} HP/${player.maxHealth} HP) was slain by ${opponent.username} (${opponent.health} HP/${opponent.maxHealth} HP)`,
                          },
                        ]
                      }
                    ]
                  }
              });
            }
            // If tie
            else {
              await res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                  data: {
                    flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                    components: [
                      {
                        type: MessageComponentTypes.CONTAINER,
                        accent_color: color,
                        components: [
                          {
                            type: MessageComponentTypes.TEXT_DISPLAY,
                            content: `## ❓ Combat Results`,
                          },
                          {
                            type: MessageComponentTypes.TEXT_DISPLAY,
                            content: `### <@${opponentUserID}> VS <@${userID}>`,
                          },
                          {
                            type: MessageComponentTypes.SEPARATOR,
                            spacing: 1
                          },
                          {
                            type: MessageComponentTypes.TEXT_DISPLAY,
                            content: `It's a tie!`,
                          },
                        ]
                      }
                    ]
                  }
              });
            }

            await DiscordRequest(endpoint, {
              method: 'DELETE'
            })
          } catch (err) {
            console.error(`Error sending message: `, err);
          }
        } 
        else {
          try {
            await getWizardMissingResponse(res);
          } catch (err) {
            console.error("Error sending response: ", err);
          } 
        }
      }
      else {
        try {
          await res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
              components: [
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content: 'This is not your fight, wizard',
                }
              ]
            }
          });
        } catch (err) {
          console.error("Error sending response: ", err);
        }
      }
    }

    return;
  }

  // Modal submission response handling 
  if (type === InteractionType.MODAL_SUBMIT) {
    const context = req.body.context;
    const userID = context === 0 ? req.body.member.user.id : req.body.user.id;

    if (data.custom_id.startsWith(`wizard_creation_`)) {
      const wizardName = data.components[1].components[0].value;
      await savePlayer(new Player(`${userID}`, wizardName));

      try {
        await res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionResponseFlags.EPHEMERAL,
            content: `${wizardName} has warped into this realm. Use /wizard to get detailed stats on your wizard. Good luck on your adventuring!`,
          }
        });
      } catch (err) {
        console.error('Error sending message', err);
      }
    }

    return;
  }

  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});


function getWizardMissingResponse(res) {
  return res.send({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
        flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
        components: [
        {
            type: MessageComponentTypes.TEXT_DISPLAY,
            content: `User does not have a wizard set up, please use /start to start!`,
        }
        ]
    }
    });
}