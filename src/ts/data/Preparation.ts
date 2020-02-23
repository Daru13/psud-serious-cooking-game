import { Recipe, IngredientEffect, IngredientEffectType } from './Recipe';
import { IngredientName } from './Ingredient';
import { MapCounter, Counts } from '../utils/MapCounter';

export enum PreparationQuality {
    NotAvailable,
    Standard, // 50 coins
    Better,   // 100 coins
    Perfect   // 200 coins + badge
}

export class Preparation {
    readonly targetRecipe: Recipe;

    private availableIngredientsCounts: MapCounter<IngredientName>;
    private mixedIngredientNames: MapCounter<IngredientName>;
    private rejectedIngredientsCounts: MapCounter<IngredientName>;

    constructor(targetRecipe: Recipe, availableIngredientNames: IngredientName[]) {
        this.targetRecipe = targetRecipe;

        this.availableIngredientsCounts = new MapCounter(availableIngredientNames, 1);
        this.mixedIngredientNames = new MapCounter();
        this.rejectedIngredientsCounts = new MapCounter();
    }

    getAllAvailableIngredients(): IngredientName[] {
        return this.availableIngredientsCounts
            .getAllCounts()
            .filter(ingredient => ingredient.count > 0)
            .map(ingredient => ingredient.key);
    }

    getAllMixedIngredients(): IngredientName[] {
        return this.mixedIngredientNames
            .getAllCounts()
            .filter(ingredient => ingredient.count > 0)
            .map(ingredient => ingredient.key);
    }

    contains(ingredientName: IngredientName): boolean {
        return this.mixedIngredientNames.getCountOf(ingredientName) > 0;
    }

    private add(ingredientName: IngredientName): boolean {
        if (! this.targetRecipe.canContain(ingredientName, this.getAllMixedIngredients())) {
            this.rejectedIngredientsCounts.increment(ingredientName);
            return false;
        }

        this.mixedIngredientNames.increment(ingredientName);
        return true;
    }

    use(ingredientName: IngredientName): boolean {
        if (this.availableIngredientsCounts.getCountOf(ingredientName) === 0) {
            return false;
        }
        
        const successfullyUsed = this.add(ingredientName);
        if (successfullyUsed) {
            this.availableIngredientsCounts.decrement(ingredientName);
        }

        return successfullyUsed;
    }

    takeBack(ingredientName: IngredientName): boolean {
        if (this.mixedIngredientNames.getCountOf(ingredientName) === 0) {
            return false;
        }

        this.mixedIngredientNames.decrement(ingredientName);
        this.availableIngredientsCounts.increment(ingredientName);
        return true;
    }

    isFinished(): boolean {
        const requiredIngredientNames = this.targetRecipe.requiredIngredientNames.values();
        for (let ingredientName of requiredIngredientNames) {
            if (!this.contains(ingredientName)) {
                return false;
            }
        }

        // A recipe must contain at least one ingredient of each alternative
        const requiredIngredientAlternatives = this.targetRecipe.requiredIngredientAlternatives.values();
        
        alternativeLoop:
        for (let alternative of requiredIngredientAlternatives) {
            for (let alternativeIngredientName of alternative) {
                if (this.contains(alternativeIngredientName)) {
                    continue alternativeLoop;
                }
            }

            return false;
        }

        return true;
    }

    private triggersEffect(effect: IngredientEffect) {
        const mixedIngredientNames = this.mixedIngredientNames
            .getAllCounts()
            .filter(ingredient => ingredient.count > 0)
            .map(ingredient => ingredient.key);

            
        for (let requiredIngredientName of effect.ingredientNames) {
            if (! mixedIngredientNames.includes(requiredIngredientName)) {
                return false;
            }
        }

        return true;
    }

    getTriggeredEffects(): IngredientEffect[] {
        return this.targetRecipe.ingredientEffects
            .filter(effect => this.triggersEffect(effect));
    }

    computeQuality(): PreparationQuality {
        if (! this.isFinished()) {
            return PreparationQuality.NotAvailable;
        }

        // If there is no positive effect, quality is necessary Standard
        const recipe = this.targetRecipe;

        if (recipe.positiveIngredientEffects.length === 0) {
            return PreparationQuality.Standard;
        }

        const triggeredEffects = this.getTriggeredEffects();
        let nbPositiveTriggeredEffects = 0;
        let nbNegativeTriggeredEffects = 0;

        for (let effect of triggeredEffects) {
            switch (effect.type) {
                case IngredientEffectType.Positive:
                    nbPositiveTriggeredEffects += 1;
                    break;
                
                case IngredientEffectType.Negative:
                    nbNegativeTriggeredEffects += 1;
                    break;
            }
        }

        // If all positive effects and no negative effect are triggered, quality is Perfect
        if (nbPositiveTriggeredEffects === recipe.positiveIngredientEffects.length
        &&  nbNegativeTriggeredEffects === 0) {
            return PreparationQuality.Perfect;
        }

        // If at least one positive effects and no negative effect is triggered, quality is Better
        if (nbPositiveTriggeredEffects > 0
        &&  nbNegativeTriggeredEffects === 0) {
            return PreparationQuality.Better;
        }

        // Otherwise, quality is Standard
        return PreparationQuality.Standard;
    }

    computeReward(): number {
        const quality = this.computeQuality();

        switch (quality) {
            case PreparationQuality.Standard:
                return 50;

            case PreparationQuality.Better:
                return 100;

            case PreparationQuality.Perfect:
                return 200;

            case PreparationQuality.NotAvailable:
            default:
                return 0;
        }
    }
}