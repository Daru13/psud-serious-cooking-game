import { IngredientName } from "./Ingredient";

export type RecipeName = string;
export type RecipeCategory = string;
export type RecipeLevel = number;

export enum IngredientEffectType {
    Positive = "POSITIVE",
    Neutral = "NEUTRAL",
    Negative = "NEGATIVE"
}

export interface IngredientEffect {
    ingredientNames: IngredientName[];
    type: IngredientEffectType;
    reason?: string;
}

interface SerialisedRecipe {
    name: string;
    category: string;
    level: number;
    requiredIngredientNames: string[];
    optionalIngredientNames: string[];
    ingredientEffects: SerialisedIngredientEffect[];
}

interface SerialisedIngredientEffect {
    ingredientNames: string[];
    type: IngredientEffectType;
    reason?: string;
}

export class Recipe {
    readonly name: RecipeName;
    readonly category: RecipeCategory;
    readonly level: RecipeLevel;

    readonly requiredIngredientNames: Set<IngredientName>;
    readonly optionalIngredientNames: Set<IngredientName>;

    readonly ingredientEffects: IngredientEffect[];
    readonly positiveIngredientEffects: IngredientEffect[];
    readonly negativeIngredientEffects: IngredientEffect[];
    readonly neutralIngredientEffects: IngredientEffect[];
    
    private constructor(name: RecipeName,
                        category: RecipeCategory,
                        level: RecipeLevel,
                        requiredIngredientNames: Set<IngredientName>,
                        optionalIngredientNames: Set<IngredientName>,
                        ingredientEffects: IngredientEffect[]) {
        this.name = name;
        this.category = category;
        this.level = level;

        this.requiredIngredientNames = requiredIngredientNames;
        this.optionalIngredientNames = optionalIngredientNames;

        this.ingredientEffects = ingredientEffects;
        this.positiveIngredientEffects = ingredientEffects.filter(effect => effect.type === IngredientEffectType.Positive);
        this.negativeIngredientEffects = ingredientEffects.filter(effect => effect.type === IngredientEffectType.Negative);
        this.neutralIngredientEffects = ingredientEffects.filter(effect => effect.type === IngredientEffectType.Neutral);
    }

    canContain(ingredientName: IngredientName): boolean {
        return this.requiredIngredientNames.has(ingredientName)
            || this.optionalIngredientNames.has(ingredientName);
    }

    static fromSerialisedRecipe(obj: SerialisedRecipe): Recipe {
        return new Recipe(
            obj.name,
            obj.category,
            obj.level,
            new Set(obj.requiredIngredientNames),
            new Set(obj.optionalIngredientNames),
            obj.ingredientEffects
        );
    }
}