import { IngredientName } from "./Ingredient";

export type RecipeName = string;
export type RecipeCategory = string;
export type RecipeLevel = number;

export enum RecipeContainer {
    Plate = "PLATE",
    Bowl = "BOWL"
}

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
    container: RecipeContainer;
    requiredIngredientNames: (string | string[])[];
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
    readonly container: RecipeContainer;

    readonly requiredIngredientNames: Set<IngredientName>;
    readonly requiredIngredientAlternatives: Set<Set<IngredientName>>;
    readonly optionalIngredientNames: Set<IngredientName>;

    readonly ingredientEffects: IngredientEffect[];
    readonly positiveIngredientEffects: IngredientEffect[];
    readonly negativeIngredientEffects: IngredientEffect[];
    readonly neutralIngredientEffects: IngredientEffect[];
    
    private constructor(name: RecipeName,
                        category: RecipeCategory,
                        level: RecipeLevel,
                        container: RecipeContainer,
                        requiredIngredientNames: Set<IngredientName>,
                        requiredIngredientAlternatives: Set<Set<IngredientName>>,
                        optionalIngredientNames: Set<IngredientName>,
                        ingredientEffects: IngredientEffect[]) {
        this.name = name;
        this.category = category;
        this.level = level;
        this.container = container;

        this.requiredIngredientNames = requiredIngredientNames;
        this.requiredIngredientAlternatives = requiredIngredientAlternatives;
        this.optionalIngredientNames = optionalIngredientNames;

        this.ingredientEffects = ingredientEffects;
        this.positiveIngredientEffects = ingredientEffects.filter(effect => effect.type === IngredientEffectType.Positive);
        this.negativeIngredientEffects = ingredientEffects.filter(effect => effect.type === IngredientEffectType.Negative);
        this.neutralIngredientEffects = ingredientEffects.filter(effect => effect.type === IngredientEffectType.Neutral);
    }

    canContain(ingredientName: IngredientName, mixedIngredients: IngredientName[]): boolean {
        const otherMixedIngredients = mixedIngredients.slice();
        const ingredientIndex = otherMixedIngredients.indexOf(ingredientName);
        if (ingredientIndex >= 0) {
            otherMixedIngredients.splice(ingredientIndex, 1);
        }

        // A recipe can only contain at most one ingredient of each alternative
        let isInAtLeastOneAlternative = false;

        for (let alternative of this.requiredIngredientAlternatives) {
            if (! alternative.has(ingredientName)) {
                continue;
            }
            
            isInAtLeastOneAlternative = true;
            
            console.log("alternative ", alternative, "has", ingredientName)

            for (let otherMixedIngredientName of otherMixedIngredients) {
                console.log("testing if alt contain " + otherMixedIngredientName)
                if (alternative.has(otherMixedIngredientName)) {
                    console.log("also contains ", otherMixedIngredientName)
                    return false;
                }
            }
        }
        
        return this.requiredIngredientNames.has(ingredientName)
            || this.optionalIngredientNames.has(ingredientName)
            || isInAtLeastOneAlternative;
    }

    static fromSerialisedRecipe(obj: SerialisedRecipe): Recipe {
        const requiredIngredientNames = obj.requiredIngredientNames
            .filter(ingredientCandidate =>
                ! Array.isArray(ingredientCandidate)
            );

        const requiredIngredientAlternatives = obj.requiredIngredientNames
            .filter(ingredientCandidate =>
                Array.isArray(ingredientCandidate)
            )
            .map(ingredientAlternative =>
                new Set(ingredientAlternative)
            );

        return new Recipe(
            obj.name,
            obj.category,
            obj.level,
            obj.container,
            new Set(requiredIngredientNames as string[]),
            new Set(requiredIngredientAlternatives),
            new Set(obj.optionalIngredientNames),
            obj.ingredientEffects
        );
    }
}