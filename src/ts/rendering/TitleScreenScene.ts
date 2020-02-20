import { Scene, SceneID } from './Scene';
import { Game } from '../Game';
import { EventManager } from '../events/EventManager';
import { StartCookingEvent } from '../events/StartCookingEvent';
import { DisplayRecipeListEvent } from '../events/DisplayRecipeListEvent';

export class TitleScreenScene extends Scene {
    static id: SceneID = "title-screen";
    id: SceneID = TitleScreenScene.id;

    constructor(game: Game) {
        super(game);
        this.createRootElement();
    }

    protected createRootElement(): void {
        super.createRootElement();

        // Main title
        const title = document.createElement("h1");
        title.textContent = "Serious Cooking Game";
        title.classList.add("main-title");
        this.root.append(title);

        // Main menu
        const menu = document.createElement("div");
        menu.classList.add("main-menu");
        this.root.append(menu);

        const playButton = document.createElement("button");
        playButton.textContent = "Play";
        playButton.classList.add("play-button");
        playButton.addEventListener("click", () => {
            const targetRecipe = this.game.getRandomUnlockedRecipe();
            EventManager.emit(new StartCookingEvent(targetRecipe));
        });
        menu.append(playButton);

        const recipeListButton = document.createElement("button");
        recipeListButton.textContent = "Recipes";
        recipeListButton.classList.add("recipes-button");
        recipeListButton.addEventListener("click", () => {
            EventManager.emit(new DisplayRecipeListEvent());
        });
        menu.append(recipeListButton);
    }
}