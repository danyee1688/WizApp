export class ArenaDB {
    static miscMessages = [
        "A flood of slimes overwhelmed _, but it turns out they just wanted a hug.",
        "_ thinks about all the times they've failed in life.",
        "Bees chase _ relentlessly.",
        "Sitting at a campfire, _ roasts some marshmallows, burning a few.",
        "As the sun rises, _ wishes that night would fall again.",
        "_ dreams about destroying their enemies",
        "_ thinks about how elephants think humans are cute.",
        "Sliding down a hill, _ accidentally kills a wee lil stick man.",
        "_ tries their hand at alchemy, but gives up after the bottle spontenously erupts into flames.",
        "_ arrives at three talking doors, one of which leads to a loot-filled room! _ chooses the wrong door.",
        "_ attempts to perform necromancy.",
        "Deep within an abandoned mineshaft, _ finds a DVD titled 'Frozen'.",
        "_'s staff falls off a cliff.",
        "_ wonders how life would be like without magic.",
        "_ holds a moment of silence for their fallen brethren.",
        "_ invents a new religion.",
        "_ wonders what it's like working a 9 to 5 job.",
        "Equipped with a book and quill, _ begins to write a memoir.",
        "_ firmly believes they're the underdog.",
        "_ enters their emo phase.",
        "_ wonders if this is all part of a simulation.",
        "_ refuses to take a shower.",
        "_ denies the existence of birds.",
        "Stumbling over their own feet, _ forgets how to walk",
        "_ takes a long break, maybe even a nap"
    ]

    static combatMessages = [
        "<caster> casts <spell> at <target>",
        "<target> gets pummeled by <spell>, used by <caster>",
    ]

    static getRandomMiscMessage(playerName) {
        let randomIndex = Math.floor(Math.random() * this.miscMessages.length);
        let message = this.miscMessages[randomIndex];
        message = message.replaceAll('_', playerName);

        return message;
    }

    static getRandomCombatMessage(playerName, opponentName, spellName) {
        let randomIndex = Math.floor(Math.random() * this.combatMessages.length);
        let message = this.combatMessages[randomIndex];
        message = message.replace("<caster>", playerName);
        message = message.replace("<target>", opponentName);
        message = message.replace("<spell>", spellName);

        return message;
    }
}