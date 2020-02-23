import { PlayerProgress } from './PlayerProgress';
import { Renderer } from './rendering/Renderer';
import { Preparation } from './data/Preparation';
import { GameData } from './data/GameData';
import { Recipe } from './data/Recipe';
import { EventManager } from './events/EventManager';
import { DisplayTitleScreenEvent } from './events/DisplayTitleScreenEvent';
import { TitleScreenScene } from './rendering/TitleScreenScene';
import { DisplayRecipeListEvent } from './events/DisplayRecipeListEvent';
import { StartCookingEvent } from './events/StartCookingEvent';
import { FinishCookingEvent } from './events/FinishCookingEvent';
import { RecipeCookingScene } from './rendering/RecipeCookingScene';
import { RecipeEvaluationScene } from './rendering/RecipeEvaluationScene';
import { RecipeListScene } from './rendering/RecipeListScene';
import { IngredientName } from './data/Ingredient';

export class Game {
    readonly data: GameData;
    readonly progress: PlayerProgress;
    currentPreparation: Preparation;
    private renderer: Renderer;

    constructor() {
        this.data = new GameData();
        this.progress = PlayerProgress.loadFromLocalStorageOrCreate(this.data);
        this.currentPreparation = null;
        this.renderer = new Renderer(this);

        this.registerAllEventHandlers();

        console.log("Game initialised!");
    }

    getRandomUnlockedRecipe(): Recipe {
        const unlockedRecipeNames = [...this.progress.getUnlockedRecipeNames().values()];
        const randomIndex = Math.floor(Math.random() * unlockedRecipeNames.length);
        const recipeName = unlockedRecipeNames[randomIndex];

        console.log(unlockedRecipeNames, randomIndex, recipeName)

        return this.data.recipes.find(recipe => recipe.name === recipeName);
    }

    registerAllEventHandlers(): void {
        EventManager.registerHandler(DisplayTitleScreenEvent, () => {
            this.renderer.displayScene(TitleScreenScene.id);
        });

        EventManager.registerHandler(DisplayRecipeListEvent, () => {
            this.renderer.displayScene(RecipeListScene.id);
        });

        EventManager.registerHandler(StartCookingEvent, (event: StartCookingEvent) => {
            const ingredientNames = new Set<IngredientName>();
            event.recipe.requiredIngredientNames.forEach(name => { ingredientNames.add(name); });
            event.recipe.optionalIngredientNames.forEach(name => { ingredientNames.add(name); });
            event.recipe.requiredIngredientAlternatives.forEach(alternative => {
                alternative.forEach(name => { ingredientNames.add(name); });
            });
            event.recipe.wrongIngredientNames.forEach(name => { ingredientNames.add(name); });

            this.currentPreparation = new Preparation(event.recipe, [...ingredientNames.values()]);

            this.renderer.displayScene(RecipeCookingScene.id);
        });

        EventManager.registerHandler(FinishCookingEvent, () => {
            this.progress.logPreparation(this.currentPreparation);
            this.renderer.displayScene(RecipeEvaluationScene.id);
        });
    }
}