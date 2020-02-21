import * as gameDataJSON from "./GameData.json";

import { Ingredient } from './Ingredient';
import { Recipe, RecipeName, RecipeCategory } from './Recipe';

export class GameData {
    readonly ingredients: Ingredient[];
    readonly recipes: Recipe[];
    readonly initiallyAvailableRecipeNames: RecipeName[];

    constructor() {
        this.ingredients = Array.from(gameDataJSON.ingredients)
            .map(Ingredient.fromSerialisedIngredient);
        this.recipes = Array.from(gameDataJSON.recipes)
            .map(Recipe.fromSerialisedRecipe);
        this.initiallyAvailableRecipeNames = gameDataJSON.initiallyAvailableRecipes;
    }

    getRecipesGroupedByCategory(): Map<RecipeCategory, Recipe[]> {
        const groupedRecipes = new Map<RecipeCategory, Recipe[]>();

        for (let recipe of this.recipes) {
            if (! groupedRecipes.has(recipe.category)) {
                groupedRecipes.set(recipe.category, []);
            }

            const group = groupedRecipes.get(recipe.category);
            group.push(recipe);
        }

        return groupedRecipes;
    }
}