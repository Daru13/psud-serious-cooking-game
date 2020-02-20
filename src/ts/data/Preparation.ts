import { Recipe } from './Recipe';
import { IngredientName } from './Ingredient';
import { MapCounter, Counts } from '../utils/MapCounter';

export class Preparation {
    readonly targetRecipe: Recipe;

    private availableIngredientsCounts: MapCounter<IngredientName>;
    private mixedIngredientNames: Set<IngredientName>;
    private rejectedIngredientsCounts: MapCounter<IngredientName>;

    constructor(targetRecipe: Recipe, availableIngredientNames: IngredientName[]) {
        this.targetRecipe = targetRecipe;

        this.availableIngredientsCounts = new MapCounter(availableIngredientNames, 1);
        this.mixedIngredientNames = new Set();
        this.rejectedIngredientsCounts = new MapCounter();
    }

    getAllAvailableIngredients(): Counts<IngredientName> {
        return this.availableIngredientsCounts.getAllCounts();
    }

    contains(ingredientName: IngredientName): boolean {
        return this.mixedIngredientNames.has(ingredientName);
    }

    private add(ingredientName: IngredientName): boolean {
        if (! this.targetRecipe.canContain(ingredientName)) {
            this.rejectedIngredientsCounts.increment(ingredientName);
            return false;
        }

        this.mixedIngredientNames.add(ingredientName);
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

    isFinished(): boolean {
        const requiredIngredientNames = this.targetRecipe.requiredIngredientNames.values();
        for (let ingredientName of requiredIngredientNames) {
            if (!this.contains(ingredientName)) {
                return false;
            }
        }

        return true;
    }
}