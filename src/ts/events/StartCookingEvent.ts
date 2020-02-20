import { Event } from './EventManager';
import { Recipe } from '../data/Recipe';

export class StartCookingEvent implements Event {
    static readonly id = "startCooking";
    readonly id = "startCooking";
    readonly recipe: Recipe;

    constructor(recipe: Recipe) {
        this.recipe = recipe;
    }
}