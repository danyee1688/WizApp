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
            "#% increased projectile damage",
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
            "#% increased area damage",
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
            "#% increased healing received",
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
            "#% increased healing received",
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
        new Stat(18, "Hawkeye's",
            "#% increased crit chance",
            [
                [20, 40],
                [41, 61],
                [62, 82],
            ],
            [
                0
            ]
        ),
        new Stat(19, "Narrowed",
            "#% increased crit chance",
            [
                [5, 10],
                [11, 15],
                [16, 20],
            ],
            [
                2
            ]
        ),
        new Stat(20, "Critical",
            "+#% crit damage",
            [
                [10, 25],
                [26, 31],
                [32, 47],
            ],
            [
                0
            ]
        ),
        new Stat(21, "Advantageous",
            "+#% crit damage",
            [
                [5, 15],
                [16, 26],
                [27, 37],
            ],
            [
                3
            ]
        ),
        new Stat(22, "Magmatic",
            "#% increased crit chance for scorch skills",
            [
                [30, 60],
                [61, 91],
                [92, 122],
            ],
            [
                0,
            ]
        ),
        new Stat(23, "Circuit-breaking",
            "#% increased crit chance for volt skills",
            [
                [30, 60],
                [61, 91],
                [92, 122],
            ],
            [
                0,
            ]
        ),
        new Stat(24, "Hare's",
            "#% increased crit chance for freeze skills",
            [
                [30, 60],
                [61, 91],
                [92, 122],
            ],
            [
                0,
            ]
        ),
        new Stat(25, "Magmatic",
            "#% increased crit chance for scorch skills",
            [
                [10, 25],
                [26, 31],
                [32, 47],
            ],
            [
                1
            ]
        ),
        new Stat(26, "Circuit-breaking",
            "#% increased crit chance for volt skills",
            [
                [10, 25],
                [26, 31],
                [32, 47],
            ],
            [
                1
            ]
        ),
        new Stat(27, "Hare's",
            "#% increased crit chance for freeze skills",
            [
                [10, 25],
                [26, 31],
                [32, 47],
            ],
            [
                1
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
        this.statList[18],
        this.statList[20],
        this.statList[22],
        this.statList[23],
        this.statList[24],
    ]

    static staffWeights = [
        5,
        5,
        5,
        5,
        5,
        5,
        3,
        3,
        4,
        4,
        4,
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
        this.statList[25],
        this.statList[26],
        this.statList[27],
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
        7,
        7,
        7
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
        this.statList[19],
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
        4,
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
        this.statList[21],
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
        15,
        4,
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

    // Returns copied stat
    // Avoids persistent changes to objects in stat lists
    static copyStat(stat) {
        let tempStat = new Stat(stat.statID, stat.statName, stat.description, stat.ranges, stat.allowedOnTypes);

        return tempStat;
    }

    // Grab random stat, weighted by item rarity
    static getRandomStat(blacklist, itemType, itemRarity) {
        let [filteredStatList, filteredWeightList] = this.filterStats(this.statListList[itemType], this.statWeightList[itemType], blacklist);
        let stat = null;

        if (filteredStatList.length > 0) {
            stat = this.copyStat(weightedChoice(filteredStatList, filteredWeightList));
            stat.tier = weightedChoice(this.statTiers, this.statTierWeights[itemRarity]);
            
            const min = stat.ranges[stat.tier][0];
            const max = stat.ranges[stat.tier][1];
            
            stat.value = Math.floor(Math.random() * (max - min + 1)) + min;
        }

        return stat;
    }

    // Remove any blacklisted stats from parameterized list
    static filterStats(list, weightsList, blacklist) {
        let filteredList = [];
        let filteredWeightList = [];

        for (let i = 0; i < list.length; i++) {
            let statFound = false;

            for (let j = 0; j < blacklist.length; j++) {
                if (list[i].statID == blacklist[j].statID) {
                    statFound = true;

                    break;
                }
            }

            if (statFound === false) {
                filteredList.push(list[i]);
                filteredWeightList.push(weightsList[i]);
            } 
        };

        return [filteredList, filteredWeightList];
    }
}