import { Item } from './item.js';
import { weightedChoice } from './chance.js';
import { Stat } from './stat.js';

export class StatDB {
    static statList = [
        new Stat(0, "Molten",
            "Gain #% scorch resistance",
            [
                [1, 5],
                [6, 10],
                [11, 15],
            ],
            [
                1,
                2,
                3,
            ]
        ),
        new Stat(1, "Crackling",
            "Gain #% volt resistance",
            [
                [1, 5],
                [6, 10],
                [11, 15],
            ],
            [
                1,
                2,
                3,
            ]
        ),
        new Stat(2, "Chilling",
            "Gain #% freeze resistance",
            [
                [1, 5],
                [6, 10],
                [11, 15],
            ],
            [
                1,
                2,
                3,
            ]
        ),
        new Stat(3, "Volcanic",
            "#% increased scorch damage",
            [ 
                [5, 15],
                [16, 26],
                [27, 37],
            ],
            [
                0, 
                1
            ]
        ),
        new Stat(4, "Infused",
            "#% increased volt damage",
            [ 
                [5, 15],
                [16, 26],
                [27, 37],
            ],
            [
                0, 
                1
            ]
        ),
        new Stat(5, "Icebreaking",
            "#% increased freeze damage",
            [ 
                [5, 15],
                [16, 26],
                [27, 37],
            ],
            [
                0, 
                1
            ]
        ),
        new Stat(6, "Fire-touched",
            "# increased scorch damage",
            [ 
                [1, 5],
                [6, 10],
                [11, 15],
            ],
            [
                2,
                3
            ]
        ),
        new Stat(7, "Lightning-touched",
            "#% increased volt damage",
            [ 
                [1, 5],
                [6, 10],
                [11, 15],
            ],
            [
                2,
                3
            ]
        ),
        new Stat(8, "Ice-touched",
            "#% increased freeze damage",
            [ 
                [1, 5],
                [6, 10],
                [11, 15],
            ],
            [
                2,
                3
            ]
        ),
        new Stat(9, "Healthy",
            "+# to maximum life",
            [ 
                [40, 60],
                [61, 80],
                [81, 100],
            ],
            [
                1,
                2,
                3
            ]
        ),
        new Stat(10, "Vital",
            "#% increased maximum life",
            [ 
                [5, 10],
                [11, 15],
                [16, 20],
            ],
            [
                1
            ]
        ),
        new Stat(11, "Flexible",
            "Gain # dexterity",
            [
                [5, 10],
                [11, 15],
                [16, 20],
            ],
            [
                1,
                2,
                3
            ]
        ),
        new Stat(12, "Hulking",
            "Gain # strength",
            [
                [5, 10],
                [11, 15],
                [16, 20],
            ],
            [
                1,
                2,
                3
            ]
        ),
        new Stat(13, "Mindful",
            "Gain # intelligence",
            [
                [5, 10],
                [11, 15],
                [16, 20],
            ],
            [
                1,
                2,
                3
            ]
        ),
        new Stat(14, "Hunter's",
            "#% increased Projectile Damage",
            [ 
                [20, 40],
                [41, 61],
                [62, 82],
            ],
            [
                0
            ]
        ),
        new Stat(15, "Radiating",
            "#% increased Area Damage",
            [
                [20, 40],
                [41, 61],
                [62, 82],
            ],
            [
                0
            ]
        ),
        new Stat(16, "Holy",
            "#% increased Healing Received",
            [
                [10, 25],
                [26, 31],
                [32, 47],
            ],
            [
                0
            ]
        ),
        new Stat(17, "Priest's",
            "#% increased Healing Received",
            [
                [5, 10],
                [11, 15],
                [16, 20],
            ],
            [
                1,
                2,
                3
            ]
        ),
    ];

    static staffStatList = [
        this.statList[3],
        this.statList[4],
        this.statList[5],
        this.statList[14],
        this.statList[15],
        this.statList[16],
    ]

    static staffWeights = [
        1,
        1,
        1,
        1,
        1,
        1,
    ]

    static amuletStatList = [
        this.statList[0],
        this.statList[1],
        this.statList[2],
        this.statList[3],
        this.statList[4],
        this.statList[5],
        this.statList[9],
        this.statList[10],
        this.statList[11],
        this.statList[12],
        this.statList[13],
    ];

    static amuletWeights = [
        10,
        10,
        10,
        10,
        10,
        10,
        12,
        2,
        10,
        10,
        10,
    ]

    static ringStatList = [
        this.statList[0],
        this.statList[1],
        this.statList[2],
        this.statList[6],
        this.statList[7],
        this.statList[8],
        this.statList[9],
        this.statList[11],
        this.statList[12],
        this.statList[13],
    ]

    static ringWeights = [
        7,
        7,
        7,
        4,
        4,
        4,
        10,
        7,
        7,
        7,
    ]

    static beltStatList = [
        this.statList[0],
        this.statList[1],
        this.statList[2],
        this.statList[6],
        this.statList[7],
        this.statList[8],
        this.statList[9],
        this.statList[11],
        this.statList[12],
        this.statList[13],
    ]

    static beltWeights = [
        7,
        7,
        7,
        4,
        4,
        4,
        20,
        15,
        15,
        15
    ]

    static statListList = {
        0: this.staffStatList,
        1: this.amuletStatList,
        2: this.ringStatList,
        3: this.beltStatList,
    }

    static statWeightList = {
        0: this.staffWeights,
        1: this.amuletWeights,
        2: this.ringWeights,
        3: this.beltWeights,
    }

    static statTiers = [
        0,
        1, 
        2
    ]

    static statTierWeights = {
        0: [80, 20, 0],
        1: [50, 38, 12],
        2: [12, 38, 50],
        3: [0, 20, 80],
    }

    static copyStat(stat) {
        let tempStat = new Stat(stat.statID, stat.statName, stat.description, stat.ranges, stat.allowedOnTypes);

        return tempStat;
    }

    static getRandomStat(itemType, itemRarity) {
        // console.log('item type : ' + itemType);
        // console.log('item rarity: ' + itemRarity);
        // console.log('stat list: ' + this.statListList[itemType]);
        // console.log('stat list weights: ' + this.statWeightList[itemType]);
        let stat = this.copyStat(weightedChoice(this.statListList[itemType], this.statWeightList[itemType]));
        stat.tier = weightedChoice(this.statTiers, this.statTierWeights[itemRarity]);
        
        const min = stat.ranges[stat.tier][0];
        const max = stat.ranges[stat.tier][1];
        
        stat.value = Math.floor(Math.random() * (max - min + 1)) + min;
        // console.log('min roll: ' + min);
        // console.log('max roll', max);
        // console.log('value: ', stat.value);

        return stat;
    }
}