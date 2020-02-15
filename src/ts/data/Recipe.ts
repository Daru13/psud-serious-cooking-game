import { Ingredient } from "./Ingredient";

export type RecipeName = string;

export class Recipe {
    readonly name: RecipeName;
    readonly requiredIngredients: Ingredient[];
    
    private constructor(name: string, requiredIngredients: Ingredient[]) {
        this.name = name;
        this.requiredIngredients = requiredIngredients;
    }
}