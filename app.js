import 'dotenv/config';
import OpenAI from 'openai';
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
import { FishDB } from './fishDB.js';
import { Fish } from './fish.js';

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

  // ====================================
  // Slash command request handling
  // ====================================
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
                    custom_id: `wizard_name_${userID}`,
                    style: TextStyleTypes.SHORT,
                    label: 'Name',
                    required: true,
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

    if (name === 'fish') {
      const context = req.body.context;
      const userID = context === 0 ? req.body.member.user.id : req.body.user.id;
      const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/@original`;

      let playerExists = await hasPlayer(userID);
      if (playerExists === true) {
        let randomDelay = Math.floor(Math.random() * 3000) + 3000;

        try {
          setTimeout(async () => {
            try {
              await DiscordRequest(endpoint, {
                method: 'PATCH',
                body: {
                  flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                  components: [
                    {
                      type: MessageComponentTypes.CONTAINER,
                      accent_color: 0x069494,
                      components: [
                        {
                          type: MessageComponentTypes.TEXT_DISPLAY,
                          content: `## 🎣 Fishing`,
                        },
                        {
                          type: MessageComponentTypes.TEXT_DISPLAY,
                          content: "Press the button when the square turns green to catch a fish!",
                        },
                        {
                          type: MessageComponentTypes.TEXT_DISPLAY,
                          content: `🟥🟥🟥\n🟥🟥🟥\n🟥🟥🟥`,
                        },
                        {
                          type: MessageComponentTypes.ACTION_ROW,
                          components: [
                            {
                              type: MessageComponentTypes.BUTTON,
                              label: 'Reel',
                              style: ButtonStyleTypes.PRIMARY,
                              custom_id: `fishing_${userID}_failed`,
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              });
            } catch (err) {
              console.error("Timeout error: " + err);
            }
          }, 50);

          setTimeout(async () => {
            try {
              await DiscordRequest(endpoint, {
                method: 'PATCH',
                body: {
                  flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                  components: [
                    {
                      type: MessageComponentTypes.CONTAINER,
                      accent_color: 0x069494,
                      components: [
                        {
                          type: MessageComponentTypes.TEXT_DISPLAY,
                          content: `## 🎣 Fishing`,
                        },
                        {
                          type: MessageComponentTypes.TEXT_DISPLAY,
                          content: "Press the button when the square turns green to catch a fish!",
                        },
                        {
                          type: MessageComponentTypes.TEXT_DISPLAY,
                          content: `🟩🟩🟩\n🟩🟩🟩\n🟩🟩🟩`,
                        },
                        {
                          type: MessageComponentTypes.ACTION_ROW,
                          components: [
                            {
                              type: MessageComponentTypes.BUTTON,
                              label: 'Reel',
                              style: ButtonStyleTypes.PRIMARY,
                              custom_id: `fishing_${userID}_succeed`,
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              });
            } catch (err) {
              console.error("Timeout error: " + err);
            }
          }, randomDelay);

          setTimeout(async () => {
            try {
              await DiscordRequest(endpoint, {
                method: 'PATCH',
                body: {
                  flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                  components: [
                    {
                      type: MessageComponentTypes.CONTAINER,
                      accent_color: 0x069494,
                      components: [
                        {
                          type: MessageComponentTypes.TEXT_DISPLAY,
                          content: `## 🎣 Fishing`,
                        },
                        {
                          type: MessageComponentTypes.TEXT_DISPLAY,
                          content: "Press the button when the square turns green to catch a fish!",
                        },
                        {
                          type: MessageComponentTypes.TEXT_DISPLAY,
                          content: `🟥🟥🟥\n🟥🟥🟥\n🟥🟥🟥`,
                        },
                        {
                          type: MessageComponentTypes.TEXT_DISPLAY,
                          content: 'Fishing encounter failed!'
                        }
                      ]
                    }
                  ]
                }
              });
            } catch (err) {
              console.error("Timeout error: " + err);
            }
          }, randomDelay + 800);

          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              flags: InteractionResponseFlags.IS_COMPONENTS_V2,
              components: [
                {
                  type: MessageComponentTypes.CONTAINER,
                  accent_color: 0x069494,
                  components: [
                    {
                      type: MessageComponentTypes.TEXT_DISPLAY,
                      content: `## 🎣 Fishing`,
                    },
                    {
                      type: MessageComponentTypes.TEXT_DISPLAY,
                      content: "Press the button when the square turns green to catch a fish!",
                    },
                    {
                      type: MessageComponentTypes.TEXT_DISPLAY,
                      content: `🟥🟥🟥\n🟥🟥🟥\n🟥🟥🟥`,
                    },
                    {
                      type: MessageComponentTypes.ACTION_ROW,
                      components: [
                        {
                          type: MessageComponentTypes.BUTTON,
                          label: 'Reel',
                          style: ButtonStyleTypes.PRIMARY,
                          custom_id: `fishing_${userID}_failed`,
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          });
        } catch (err) {
          console.log("Error sending response: ", err);
        }
      }
      else {
        try {
          return getWizardMissingResponse(res);
        } catch (err) {
          console.error("Error sending response: ", err);
        }
      }
    }

    if (name === 'gamble') {
      const context = req.body.context;
      const percentage = req.body.data.options[0].value;
      const coinSide = req.body.data.options[1].value;
      const userID = context === 0 ? req.body.member.user.id : req.body.user.id;

      console.log("percentage wagered: " , percentage);

      let playerExists = await hasPlayer(userID);

      if (playerExists === true) {
        let player = await loadPlayer(userID);

        if (player.gold >= 250) {
          const wager = Math.floor(player.gold * percentage);
          console.log("wager: ", wager);
          // Subtract wager from player's gold
          player.gold -= wager;

          let flipResult = 0;
          let flipSide = "";
          // 50% chance of heads
          // 50% chance of tails
          if (chance(50) === true) {
            flipResult = 1;
            flipSide = "heads";
          } 
          else {
            flipResult = 0;
            flipSide = "tails";
          }

          // If coin side matches flip result
          // Gain double the wager
          if (flipResult === coinSide) {
            player.gold += wager * 2;
            await savePlayer(player);

            return res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                components: [
                  {
                    type: MessageComponentTypes.CONTAINER,
                    accent_color: 0x00FF00,
                    components: [
                      {
                        type: MessageComponentTypes.TEXT_DISPLAY,
                        content: '## 📈 Gamble Results',
                      },
                      {
                        type: MessageComponentTypes.TEXT_DISPLAY,
                        content: `The coin landed on ${flipSide}`,
                      },
                      {
                        type: MessageComponentTypes.TEXT_DISPLAY,
                        content: `You've won ${wager * 2} gold!`,
                      },
                      {
                        type: MessageComponentTypes.SEPARATOR,
                        spacing: 1,
                      },
                      {
                        type: MessageComponentTypes.TEXT_DISPLAY,
                        content: `${player.username} now has ${player.gold} gold`
                      }
                    ]
                  }
                ],
              }
            });
          }
          // Lose the wager
          else {
            await savePlayer(player);

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
                        content: '## 📉 Gamble Results',
                      },
                      {
                        type: MessageComponentTypes.TEXT_DISPLAY,
                        content: `The coin landed on ${flipSide}`,
                      },
                      {
                        type: MessageComponentTypes.TEXT_DISPLAY,
                        content: `You've lost ${wager} gold`,
                      },
                      {
                        type: MessageComponentTypes.SEPARATOR,
                        spacing: 1,
                      },
                      {
                        type: MessageComponentTypes.TEXT_DISPLAY,
                        content: `${player.username} now has ${player.gold} gold`
                      }
                    ]
                  }
                ],
              }
            });
          }
        }
        else {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
              components: [
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content: `Unfortunately, you do not have enough gold to gamble\nYou need at least 250 gold\nYou have ${player.gold} gold`
                }
              ],
            }
          });
        }
      }
      else {
        try {
          return getWizardMissingResponse(res);
        } catch (err) {
          console.error('Error sending message: ', err);
        }
      }
    }

    if (name === 'ponder') {
      const context = req.body.context;
      const userID = context === 0 ? req.body.member.user.id : req.body.user.id;
      try {
        return res.send({
          type: InteractionResponseType.MODAL,
          data: {
            custom_id: `ponder_submit_${userID}`,
            title: '🔮 The Orb',
            components: [
              {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `The Orb awaits your queries, glimmering with anticipation and wisdom`,
              },
              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.INPUT_TEXT,
                    custom_id: `ponder_message_${userID}`,
                    style: TextStyleTypes.PARAGRAPH,
                    label: 'Question',
                    min_length: 1,
                    max_length: 4000,
                    required: true,
                    placeholder: 'Enter your ponderances here',
                  },
                ],
              },
            ]
          }
        });
      } catch (err) {
        console.log("Error sending message: ", err);
      }
    }

    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });
  }

  // ====================================
  // Message component response handling
  // ====================================
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
    else if (componentID.startsWith('fish_list_')) {
      const context = req.body.context;
      const userID = componentID.split('_')[2];
      const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;

      let player = await loadPlayer(userID);
      let componentList = player.showFish().concat([
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
        let color = 0x000000;

        // Set container color to red if loss,
        // green if win
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
            player.gold += results.goldGained ? results.goldGained : 0;

            let lootComponents = [];
            const followUpEndpoint = `webhooks/${process.env.APP_ID}/${req.body.token}`;
            let lootList = LootManager.getLootEnemy(enemy.enemyTier);

            lootComponents = [
              {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `${enemy.enemyName} dropped ${results.goldGained} gold`,
              },
              {
                type: MessageComponentTypes.SEPARATOR,
                spacing: 1
              },
              {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `${player.username} now has ${player.gold} gold`,
              },
            ]

            // Add components if enemy dropped an item or more
            if (lootList.length > 0) {
              lootComponents = lootComponents.concat({
                type: MessageComponentTypes.SEPARATOR,
                spacing: 1,
              });

              // Plural check
              if (lootList.length === 1) {
                lootComponents = lootComponents.concat([
                  {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: `${enemy.enemyName} dropped an item!`
                  }
                ]);
              }
              else if (lootList.length > 1) {
                lootComponents = lootComponents.concat([
                  {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: `${enemy.enemyName} dropped some items!`
                  }
                ]);
              }
            }

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
                        }
                      ].concat(lootComponents),
                    }
                  ]
                }
            });

            // Post requests for loot dropped (if any)
            for (let i = 0; i < lootList.length; i++) {
              await DiscordRequest(followUpEndpoint, {
                method: "POST",
                body: LootManager.lootToComponent(lootList[i], userID),
              });
            }
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

          await savePlayer(player);

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
      const followUpEndpoint = `webhooks/${process.env.APP_ID}/${req.body.token}`;
      
      const playerExists = await hasPlayer(userID);
      if (playerExists === true) {
        const player = await loadPlayer(userID);

        try {
          // Check if player has enough gold
          if (player.gold >= 500) {
            player.gold -= 500; 
            await savePlayer(player);
            let lootList = LootManager.getLootShop();
            let success = false;

            if (lootList.length > 0) {
              success = true;
            }
            
            // If nothing went wrong, continue with sending the appropiate message
            if (success === true) {
              await res.send({
                type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
              });

              // Loop through loot list and send new messages for each
              for (let i = 0; i < lootList.length; i++) {
                await DiscordRequest(followUpEndpoint, {
                  method: "POST",
                  body: LootManager.lootToComponent(lootList[i], userID),
                })
              }

              // Update shop to show remaining coin balance
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

      // Delete shop message
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

      if (LootManager.hasLoot(itemID)) {
        LootManager.removeLoot(itemID);
      }

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
      // Make component list for player's inventory
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
      const spellTier = componentID.split('_')[4];
      const spell = SpellDB.spellList[spellID][spellTier];
      const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;

      // Check if user pressing button is the same as the one who dropped the loot
      if (userID === lootUserID) {
        const playerExists = await hasPlayer(userID);
        if (playerExists === true) {
          const player = await loadPlayer(userID);

          // Delete loot message and show spell equip menu
          // User can choose between 3 slots
          // If there was spell in that slot, that spell is written over
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
                            custom_id: `equip_spell_1_${spellID}_${spellTier}`
                          },
                          {
                            type: MessageComponentTypes.BUTTON,
                            style: ButtonStyleTypes.SECONDARY,
                            label: `2 - ${player.getSpellName(1)}`,
                            custom_id: `equip_spell_2_${spellID}_${spellTier}`
                          },
                          {
                            type: MessageComponentTypes.BUTTON,
                            style: ButtonStyleTypes.SECONDARY,
                            label: `3 - ${player.getSpellName(2)}`,
                            custom_id: `equip_spell_3_${spellID}_${spellTier}`
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
      const spellSlot = Number(componentID.split('_')[2]) - 1;
      const spellID = componentID.split('_')[3];
      const spellTier = componentID.split('_')[4];
      const spell = SpellDB.spellList[spellID][spellTier];
      const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/@original`;

      const playerExists = await hasPlayer(userID);
      if (playerExists === true) {
        const player = await loadPlayer(userID);

        // Player learns respective spell and saves immediately
        player.learnSpell(spellSlot, spell);
        savePlayer(player);

        try {
          await res.send({
            type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
          });

          // Patch previous method to show which slot spell was 
          // placed in
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

        // Check if players exist for both users
        // Initiator and target must both have wizards set up
        if (playerExists === true) {
          let player = await loadPlayer(userID);
          let opponent = await loadPlayer(opponentUserID);
          // Start battle and get results
          let results = await duel(player, opponent);
          let color = 0x000000;

          // Green if initiator wins, red if they lose
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
    else if (componentID.startsWith('fishing_')) {
      const context = req.body.context;
      const userID = context === 0 ? req.body.member.user.id : req.body.user.id;
      const fisherID = componentID.split('_')[1];
      const result = componentID.split('_')[2];
      const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;

      try {
        // Check if user who used command is same as the person 
        // who clicked the reel button
        if (userID === fisherID) {
          // Get fish, weighted
          const fish = FishDB.getRandomFish();

          // Determine which message to send depending on 
          // whether or not user was able to press the 
          // reel button in time
          if (result === 'succeed') {
            await res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                flags: InteractionResponseFlags.IS_COMPONENTS_V2,
                components: [
                  {
                    type: MessageComponentTypes.CONTAINER,
                    accent_color: 0x069494,
                    components: [
                      {
                        type: MessageComponentTypes.TEXT_DISPLAY,
                        content: "## 🐟 Fishing Success!",
                      },
                      {
                        type: MessageComponentTypes.TEXT_DISPLAY,
                        content: `<@${userID}> caught a ${fish.fishName}`
                      },
                      {
                        type: MessageComponentTypes.TEXT_DISPLAY,
                        content: `Weight: ${fish.weight} lbs (${fish.getWeightPercentageString()})`
                      },
                      {
                        type: MessageComponentTypes.TEXT_DISPLAY,
                        content: `Value: ${fish.value} gold`,
                      },
                      {
                        type: MessageComponentTypes.ACTION_ROW,
                        components: [
                          {
                            type: MessageComponentTypes.BUTTON,
                            style: ButtonStyleTypes.PRIMARY,
                            label: 'Sell',
                            custom_id: `sell_fish_${userID}_${fish.value}`
                          },
                          {
                            type: MessageComponentTypes.BUTTON,
                            style: ButtonStyleTypes.PRIMARY,
                            label: 'Keep',
                            custom_id: `keep_fish_${userID}_${fish.fishID}_${fish.fishRarity}_${fish.weight}_${fish.value}`
                          },
                        ]
                      }
                    ]
                  },  
                ]
              }
            })
          }
          else {
            await res.send({
              type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
              data: {
                flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
                components: [
                  {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: `Better luck next time! The ${fish.fishName} escaped!`
                  }
                ]
              }
            });
          }

          await DiscordRequest(endpoint, {
            method: 'DELETE',
          });
        }
        else {
          await res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
              components: [
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content: "This ain't your fish, buckaroo",
                }
              ]
            }
          });
        }
      } catch (err) {
        console.error('Error sending message: ', err);
      }
    }
    else if (componentID.startsWith('sell_fish_')) {
      const context = req.body.context;
      const userID = context === 0 ? req.body.member.user.id : req.body.user.id;
      const fisherID = componentID.split('_')[2];
      const fishValue = componentID.split('_')[3];
      const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;

      // Check if user who used command is same as the person 
      // who clicked the sell button
      if (fisherID === userID) {
        // Load player and give player respective gold
        // from fish value
        let player = await loadPlayer(userID);
        player.gold += Number(fishValue);

        await res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [
              {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `Fish has been sold for ${fishValue} gold!`
              },
              {
                type: MessageComponentTypes.SEPARATOR,
                spacing: 1,
              },
              {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: `${player.username} now has ${player.gold} gold`
              }
            ]
          }
        });

        await DiscordRequest(endpoint, {
          method: 'DELETE',
        });

        await savePlayer(player);
      } 
      else {
        await res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [
              {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: "This ain't your fish, buckaroo",
              }
            ]
          }
        });
      }
    }
    else if (componentID.startsWith('keep_fish_')) {
      const context = req.body.context;
      const userID = context === 0 ? req.body.member.user.id : req.body.user.id;
      const fisherID = componentID.split('_')[2];
      const fishID = componentID.split('_')[3];
      const fishRarity = componentID.split('_')[4];
      const fishWeight = Number(componentID.split('_')[5]);
      const fishValue = Number(componentID.split('_')[6]);
      const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;

      // Check if user who used command is same as the person 
      // who clicked the keep button
      if (fisherID === userID) {
        // Load player and fish fields
        let player = await loadPlayer(userID);
        let fish = Fish.copyFish(FishDB.fishListDict[fishRarity][fishID]);
        fish.weight = fishWeight;
        fish.value = fishValue;

        // Ensure player does not have more than 10 fish
        // in their barrel
        // Swap fish out if they have more than 10 fish
        if (player.fishList.length >= 10) {
          await res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
              components: [
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content: 'Fish Caught:',
                },
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content: `${fish.getShortenedDetails()}`,
                },
                {
                  type: MessageComponentTypes.SEPARATOR,
                  spacing: 1,
                },
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content: 'You have too many fish in your barrel, which fish would you like to swap out?',
                },
                {
                  type: MessageComponentTypes.ACTION_ROW,
                  components: [
                    {
                      type: MessageComponentTypes.STRING_SELECT,
                      placeholder: "Select a fish",
                      custom_id: `fish_select_${fishID}_${fishRarity}_${fishWeight}_${fishValue}`,
                      options: player.getFishOptions(),
                    }
                  ]
                }
              ]
            }
          })
        } 
        else {
          player.fishList.push(fish);

          await res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
              components: [
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content: `Added ${fish.fishName} to ${player.username}'s fish barrel!`
                },
              ]
            }
          });
        }

        await DiscordRequest(endpoint, {
          method: 'DELETE',
        });

        await savePlayer(player);
      } 
      else {
        await res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [
              {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: "This ain't your fish, buckaroo",
              }
            ]
          }
        });
      }
    }
    else if (componentID.startsWith('fish_select_')) {
      const context = req.body.context;
      const userID = context === 0 ? req.body.member.user.id : req.body.user.id;
      const fishID = componentID.split('_')[2];
      const fishRarity = componentID.split('_')[3];
      const fishWeight = Number(componentID.split('_')[4]);
      const fishValue = Number(componentID.split('_')[5]);
      const swapIndex = req.body.data.values[0];
      const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;
      
      try {
        // Load player and fish fields
        let player = await loadPlayer(userID);
        let fish = Fish.copyFish(FishDB.fishListDict[fishRarity][fishID]);
        fish.weight = fishWeight;
        fish.value = fishValue;

        // Swap fish in player's fish barrel
        player.fishList.splice(swapIndex, 1, fish);

        await res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
              components: [
                {
                  type: MessageComponentTypes.TEXT_DISPLAY,
                  content: `Added ${fish.fishName} to ${player.username}'s fish barrel!`
                },
              ]
            }
          });

        await DiscordRequest(endpoint, {
          method: "DELETE",
        })

        await savePlayer(player);
      } catch (err) {
        console.error("Error sending message: ", err);
      }
    }
    else if (componentID.startsWith('dismiss_message_')) {
      const context = req.body.context;
      const dismisserID = context === 0 ? req.body.member.user.id : req.body.user.id;
      const userID = componentID.split('_')[2];
      const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;
      const itemID = Number(componentID.split('_')[3]);

      if (LootManager.hasLoot(itemID)) {
        LootManager.removeLoot(itemID);
      }

      // Check if dismisser is the same person who initiated
      // the message response
      if (userID === dismisserID) {
        try {
          await res.send({
            type: InteractionResponseType.DEFERRED_UPDATE_MESSAGE,
          });

          await DiscordRequest(endpoint, {
            method: "DELETE",
          });
        } catch (err) {
          console.error("Error sending message: ", err);
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
                  content: 'You cannot dismiss this message',
                }
              ]
            }
          });
        } catch (err) {
          console.error("Error sending message", err);
        }
      }
    }

    return;
  }

  // ====================================
  // Modal component submission handling
  // ====================================
  if (type === InteractionType.MODAL_SUBMIT) {
    const context = req.body.context;
    const userID = context === 0 ? req.body.member.user.id : req.body.user.id;
    const followUpEndpoint = `webhooks/${process.env.APP_ID}/${req.body.token}`;

    // Wizard creation modal handling, creating new player 
    // with specified name in parameters
    if (data.custom_id.startsWith(`wizard_creation_`)) {
      const wizardName = data.components[1].components[0].value;
      await savePlayer(new Player(`${userID}`, wizardName));

      try {
        await res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        });
      } catch (err) {
        console.error('Error sending message', err);
      }
    }
    else if (data.custom_id.startsWith(`ponder_submit_`)) {
      const message = data.components[1].components[0].value;
      let response = ""; 

      try {
         await res.send({
          type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            flags: InteractionResponseType.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [
              {
                type: MessageComponentTypes.TEXT_DISPLAY,
                content: "The orb is thinking...",
              }
            ]
          }
        });
      } catch (err) {
        console.error("Error deferring message", err);
      }
     
      // Get new client
      const client = new OpenAI();
      let errorOccurred = false;

      // Try to get response from ChatGPT
      try {
        let rawResponse = await client.responses.create({
          model: 'gpt-4o-mini',
          input: [
            {
              role: "system",
              content: "You are a wise wizard who has lived for thousands of years offering advice to new wizards. Keep response below 250 characters."
            },
            {
              role: "user",
              content: message,
            }
          ],
          max_output_tokens: 500,
        });

        response = rawResponse.output_text;

        console.log("Ponder Response: ", response);
      } catch (err) {
        errorOccurred = true;

        console.error("Error Code: ", err.message.split(' ')[0]);
        console.error("Error with OpenAI response: ", err);
      }
      
      try {
        await DiscordRequest(followUpEndpoint, {
          method: "POST",
          body: {
            flags: InteractionResponseFlags.IS_COMPONENTS_V2,
            components: [
              {
                type: MessageComponentTypes.CONTAINER,
                accent_color: 0xFF00FF,
                components:
                [
                  {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: '## 🔮 The Orb'
                  },
                  {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: `<@${userID}> has pondered:\n${message}`
                  },
                  {
                    type: MessageComponentTypes.SEPARATOR,
                    spacing: 1,
                  },
                  {
                    type: MessageComponentTypes.TEXT_DISPLAY,
                    content: `The Orb reveals:\n${response}`
                  },
                ]
              }
            ]
          }
        });
      } catch (err) {
        console.error("Error sending message: ", err);
      }
    }

    return;
  }

  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});

// Set up listening port
app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});


// Helper function to display a message showing user that 
// the user inquired does not have a wizard set up
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