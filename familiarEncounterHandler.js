import { ButtonStyleTypes, InteractionResponseFlags, InteractionResponseType, MessageComponentTypes } from "discord-interactions";
import { chance } from "./chance.js";

export class FamiliarEncounterHandler {
    static activeBattles = {};

    static async startBattle(res, player, familiar) {
        let selectedFamiliar = player.familiars[0];

        this.activeBattles[player.userID] = {
            player: player,
            activeFamiliar: selectedFamiliar,
            encounterFamiliar: familiar,
            turn: 0,
        }

        await res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
                flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
                components: [
                    {
                        type: MessageComponentTypes.TEXT_DISPLAY,
                        content: '## 💥 Familiar Encounter'                        
                    },
                    {
                        type: MessageComponentTypes.CONTAINER,
                        accent_color: 0xFF0000,
                        components: familiar.toBattleComponent(),
                    },
                    {
                        type: MessageComponentTypes.CONTAINER,
                        accent_color: 0x00FF00,
                        components: selectedFamiliar.toBattleComponent(),
                    },
                    {
                        type: MessageComponentTypes.CONTAINER,
                        accent_color: 0x000000,
                        components: [
                            {
                                type: MessageComponentTypes.TEXT_DISPLAY,
                                content: 'Actions'
                            },
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: "Moves",
                                        custom_id: `familiar_moves_${player.userID}`,
                                        style: ButtonStyleTypes.PRIMARY,
                                    },
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: "Befriend",
                                        custom_id: `befriend_familiar_${player.userID}`,
                                        style: ButtonStyleTypes.PRIMARY,
                                    },
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: "Dismiss",
                                        custom_id: `dismiss_encounter_${player.userID}`,
                                        style: ButtonStyleTypes.PRIMARY,
                                    },
                                ]
                            },
                        ]
                    }
                ]
            }
        });
    }

    static async backToEncounter(res, userID) {
        let battle = this.activeBattles[userID];
        let familiar = battle.encounterFamiliar;
        let selectedFamiliar = battle.activeFamiliar;

        await res.send({
            type: InteractionResponseType.UPDATE_MESSAGE,
            data: {
                flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
                components: [
                    {
                        type: MessageComponentTypes.TEXT_DISPLAY,
                        content: '## 💥 Familiar Encounter'                        
                    },
                    {
                        type: MessageComponentTypes.CONTAINER,
                        accent_color: 0xFF0000,
                        components: familiar.toBattleComponent(),
                    },
                    {
                        type: MessageComponentTypes.CONTAINER,
                        accent_color: 0x00FF00,
                        components: selectedFamiliar.toBattleComponent(),
                    },
                    {
                        type: MessageComponentTypes.CONTAINER,
                        accent_color: 0x000000,
                        components: [
                            {
                                type: MessageComponentTypes.TEXT_DISPLAY,
                                content: 'Actions'
                            },
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: "Moves",
                                        custom_id: `familiar_moves_${userID}`,
                                        style: ButtonStyleTypes.PRIMARY,
                                    },
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: "Befriend",
                                        custom_id: `befriend_familiar_${userID}`,
                                        style: ButtonStyleTypes.PRIMARY,
                                    },
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: "Dismiss",
                                        custom_id: `dismiss_encounter_${userID}`,
                                        style: ButtonStyleTypes.PRIMARY,
                                    },
                                ]
                            },
                        ]
                    }
                ]
            }
        });
    }

    static async showMoves(res, userID) {
        let battle = this.activeBattles[userID];
        let familiar = battle.encounterFamiliar;
        let selectedFamiliar = battle.activeFamiliar;
        
        let manaString = '';

        for (let i = 0; i < selectedFamiliar.mana; i++) {
            manaString += '🔹';
        }

        let moveComponentList = [];

        for (let i = 0; i < selectedFamiliar.moveSet.length; i++) {
            moveComponentList.push({
                type: MessageComponentTypes.BUTTON,
                label: `${selectedFamiliar.moveSet[i].toString()}`,
                custom_id: `use_move_${userID}_${i}`,
                style: ButtonStyleTypes.PRIMARY,
            });
        }

        moveComponentList.push({
            type: MessageComponentTypes.BUTTON,
            label: `Back`,
            custom_id: `back_to_encounter_${userID}`,
            style: ButtonStyleTypes.SECONDARY,
        })

        await res.send({
            type: InteractionResponseType.UPDATE_MESSAGE,
            data: {
                flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
                components: [
                    {
                        type: MessageComponentTypes.TEXT_DISPLAY,
                        content: '## 💥 Familiar Encounter'                        
                    },
                    {
                        type: MessageComponentTypes.CONTAINER,
                        accent_color: 0xFF0000,
                        components: familiar.toBattleComponent(),
                    },
                    {
                        type: MessageComponentTypes.CONTAINER,
                        accent_color: 0x00FF00,
                        components: selectedFamiliar.toBattleComponent(),
                    },
                    {
                        type: MessageComponentTypes.CONTAINER,
                        accent_color: 0x000000,
                        components: [
                            {
                                type: MessageComponentTypes.TEXT_DISPLAY,
                                content: 'Moves | ' + manaString,
                            },
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: moveComponentList,
                            },
                        ]
                    }
                ]
            }
        });
    }

    static async useMove(res, userID, moveIndex) {
        let battle = this.activeBattles[userID];
        let familiar = battle.encounterFamiliar;
        let selectedFamiliar = battle.activeFamiliar;

        // Enemy goes first
        if (familiar.speed > selectedFamiliar.speed) {
            familiar.useRandomMove(selectedFamiliar);
            selectedFamiliar.useMove(moveIndex, familiar);
        }
        // Player goes first
        else if (familiar.speed < selectedFamiliar.speed) {
            selectedFamiliar.useMove(moveIndex, familiar);
            familiar.useRandomMove(selectedFamiliar);
        }
        // Random
        else {
            // Player goes first
            if (chance(50) === true) {
                selectedFamiliar.useMove(moveIndex, familiar);
                familiar.useRandomMove(selectedFamiliar);
            }
            // Enemy goes first
            else {
                familiar.useRandomMove(selectedFamiliar);
                selectedFamiliar.useMove(moveIndex, familiar);
            }
        }

        await res.send({
            type: InteractionResponseType.UPDATE_MESSAGE,
            data: {
                flags: InteractionResponseFlags.EPHEMERAL | InteractionResponseFlags.IS_COMPONENTS_V2,
                components: [
                    {
                        type: MessageComponentTypes.TEXT_DISPLAY,
                        content: '## 💥 Familiar Encounter'                        
                    },
                    {
                        type: MessageComponentTypes.CONTAINER,
                        accent_color: 0xFF0000,
                        components: familiar.toBattleComponent(),
                    },
                    {
                        type: MessageComponentTypes.CONTAINER,
                        accent_color: 0x00FF00,
                        components: selectedFamiliar.toBattleComponent(),
                    },
                    {
                        type: MessageComponentTypes.CONTAINER,
                        accent_color: 0x000000,
                        components: [
                            {
                                type: MessageComponentTypes.TEXT_DISPLAY,
                                content: 'Actions'
                            },
                            {
                                type: MessageComponentTypes.ACTION_ROW,
                                components: [
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: "Moves",
                                        custom_id: `familiar_moves_${userID}`,
                                        style: ButtonStyleTypes.PRIMARY,
                                    },
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: "Befriend",
                                        custom_id: `befriend_familiar_${userID}`,
                                        style: ButtonStyleTypes.PRIMARY,
                                    },
                                    {
                                        type: MessageComponentTypes.BUTTON,
                                        label: "Dismiss",
                                        custom_id: `dismiss_encounter_${userID}`,
                                        style: ButtonStyleTypes.PRIMARY,
                                    },
                                ]
                            },
                        ]
                    }
                ]
            }
        });
    }
}
