import { Recipe } from './Recipe';
import { IngredientName } from './Ingredient';
import { MapCounter, Counts } from '../utils/MapCounter';

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

    getAllAvailableIngredients(): Counts<IngredientName> {
        return this.availableIngredientsCounts
            .getAllCounts()
            .filter(ingredient => ingredient.count > 0);
    }

    contains(ingredientName: IngredientName): boolean {
        return this.mixedIngredientNames.getCountOf(ingredientName) > 0;
    }

    private add(ingredientName: IngredientName): boolean {
        if (! this.targetRecipe.canContain(ingredientName)) {
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

        return true;
    }
}