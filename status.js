export class Status {
    constructor(statusID, statusName, description, duration, behavior, value = null) {
        this.statusID = statusID,
        this.statusName = statusName, 
        this.description = description,
        this.duration = duration,
        this.behavior = behavior,
        this.value = value
    }
}