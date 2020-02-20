import { Event } from './EventManager';

export class DisplayRecipeListEvent implements Event {
    static readonly id = "displayRecipeList";
    readonly id = "displayRecipeList";
}