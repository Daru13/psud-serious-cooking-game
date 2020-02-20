import { Event } from './EventManager';

export class FinishCookingEvent implements Event {
    static readonly id = "finishCooking";
    readonly id = "finishCooking";
}