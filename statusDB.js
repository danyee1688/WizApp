import { Status } from "./status.js";

export class StatusDB {
    static statusList = [
        new Status(0, "Ignited", "Enveloped by fire", 3, "Refreshing"),
        new Status(1, "Shocked", "Electrified and taking more damage", 3, "Stacking"),
        new Status(2, "Frozen", "Encased in solid ice and can't move", 3, "Non-refreshing")
    ]
}