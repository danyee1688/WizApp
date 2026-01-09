export class WikiDB {
    static wikiEntries = {
        "Strength": {
            title: "Strength",
            entry: "Strength is how strong a wizard is in terms of pure guile. "
            + "Wizards gain 1 maximum health per 2 strength they have.",
        },
        "Dexterity": {
            title: "Dexterity",
            entry: "Dexterity is how flexible a wizard is. Maybe they achieved "
            + "their flexibility by doing loads of jumping jacks! A wizard "
            + "gains 1% dodge chance per 5 dexterity they have.",
        },
        "Intelligence": {
            title: "Intelligence",
            entry: "Intelligence is how large a wizards noggin is, or how many "
            + "brain cells are still present. Wizards gain 1% increased healing "
            + "received per 4 intelligence they have.",
        },
        "Critical Hits": {
            title: "Critical Hits",
            entry: "A critical hit is an instance of damage that does more "
            + "damage based on critical damage. Each spell has it's own base "
            + "critical hit chance and critical hit damage, abbreviated as "
            + "CC and CD in the /wizard menu. ",
        },
        "Resistances": {
            title: "Elemental Resistances",
            entry: "Elemental resistances are how wizards and their enemies "
            + "protect themselves from damage. It acts as a multiplier on "
            + "incoming damage. If an enemy has 100% scorch resistance, " 
            + "they simply receive no scorch damage. Players are capped at "
            + "50% for each element (scorch, volt, freeze)."
        },
        "Items": {
            title: "Items",
            entry: "Items are what a wizard equips to become stronger. "
            + "A wizard has one trusty weapon: their staff. Staves usually "
            + "have stats that are related to doing more damage. A wizard "
            + "can also equip an amulet, a ring, and a belt. Each item has "
            + "it's own stat pool with relative weights. Each item also has " 
            + "rarity, which influences how many stats it can have and the chances "
            + "for getting higher tier stats."
        },
        "Spells": {
            title: "Spells",
            entry: "Spells are a wizard's main way to deal damage. Each spell "
            + "has it's damage split into 3 categories: scorch, volt, and freeze. "
            + "Each spell also has respective tags. These tags are important when "
            + "considering which items to equip. Spells have tiers, meaning that "
            + "a tier 1 spell will be less powerful compared to a tier 5 spell."
        },
        "Damage": {
            title: "Damage Overview",
            entry: "When a player does damage via a spell, the damage is split "
            + "into three parts: scorch, volt, and freeze damage. Each damage type "
            + "will be considered when calculating increases to that type of damage. "
            + "Increases to damage are additive, meaning each 4% increased scorch damage "
            + "and 15% increased damage will be added together for 19% increased "
            + "damage for calculations. After increased damage is calculated, critical "
            + "hit damage will be calculated, given the hit was a critical hit. Critical " 
            + "hit damage is calculated on the previously increased damage, making it "
            + "multiplicative."
        },
    };
}