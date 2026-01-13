export class LootManager {
    static activeLoot = new Map();

    static addLoot(itemID, item) {
        this.activeLoot.set(itemID, item);
    }

    static removeLoot(itemID) {
        this.activeLoot.delete(itemID);
    }
}