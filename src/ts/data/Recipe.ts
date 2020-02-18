import { IngredientName } from "./Ingredient";

export type RecipeName = string;

export enum IngredientEffetType { Positive, Neutral, Negative }

export interface IngredientEffect {
    ingredientName: IngredientName;
    type: IngredientEffetType;
    reason?: string;
}

export class Recipe {
    readonly name: RecipeName;

    readonly requiredIngredientNames: Set<IngredientName>;
    readonly optionalIngredientNames: Set<IngredientName>;
    readonly ingredientEffects: Map<IngredientName, IngredientEffect>;
    
    private constructor(name: string,
                        requiredIngredientNames: Set<IngredientName>,
                        optionalIngredientNames: Set<IngredientName>,
                        ingredientEffects: Map<IngredientName, IngredientEffect>) {
        this.name = name;

        this.requiredIngredientNames = requiredIngredientNames;
        this.optionalIngredientNames = optionalIngredientNames;
        this.ingredientEffects = ingredientEffects;
    }

    canContain(ingredientName: IngredientName): boolean {
        return this.requiredIngredientNames.has(ingredientName)
            || this.optionalIngredientNames.has(ingredientName);
    }
}