import { Scene, SceneID } from './Scene';
import { Game } from '../Game';

export class TitleScreenScene extends Scene {
    id: SceneID = "title-screen";

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
            // TODO
        });
        menu.append(playButton);

        const recipeListButton = document.createElement("button");
        recipeListButton.textContent = "Recipes";
        recipeListButton.classList.add("recipes-button");
        recipeListButton.addEventListener("click", () => {
            // TODO
        });
        menu.append(recipeListButton);
    }
}