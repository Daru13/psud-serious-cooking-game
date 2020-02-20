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

export class Game {
    readonly data: GameData;
    private renderer: Renderer;
    private progress: PlayerProgress;
    currentPreparation: Preparation;

    constructor() {
        this.data = new GameData();
        this.renderer = new Renderer(this);
        this.progress = PlayerProgress.loadFromLocalStorageOrCreate(this.data);
        this.currentPreparation = null;

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
            console.log("DisplayTitleScreenEvent");
            this.renderer.displayScene(TitleScreenScene.id);
        });

        EventManager.registerHandler(DisplayRecipeListEvent, () => {
            console.log("DisplayRecipeListEvent");
            // TODO
        });

        EventManager.registerHandler(StartCookingEvent, (event: StartCookingEvent) => {
            console.log("StartCookingEvent", event);
            this.currentPreparation = new Preparation(event.recipe);
            this.renderer.displayScene(RecipeCookingScene.id);
        });

        EventManager.registerHandler(FinishCookingEvent, () => {
            console.log("FinishCookingEvent");
            this.renderer.displayScene(RecipeEvaluationScene.id);
        });
    }
}