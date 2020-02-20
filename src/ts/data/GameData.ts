import * as gameDataJSON from "./GameData.json";

import { Ingredient } from './Ingredient';
import { Recipe } from './Recipe';

export class GameData {
    readonly ingredients: Ingredient[];
    readonly recipes: Recipe[];

    constructor() {
        this.ingredients = Array.from(gameDataJSON.ingredients)
            .map(Ingredient.fromSerialisedIngredient);
        this.recipes = Array.from(gameDataJSON.recipes)
            .map(Recipe.fromSerialisedRecipe);
    }
}