import { SceneID, Scene } from './Scene';
import { Game } from '../Game';
import { Preparation } from '../data/Preparation';
import { EventManager } from '../events/EventManager';
import { DisplayTitleScreenEvent } from '../events/DisplayTitleScreenEvent';
import { StartCookingEvent } from '../events/StartCookingEvent';

export class RecipeEvaluationScene extends Scene {
    static id: SceneID = "recipe-evaluation";
    id: SceneID = RecipeEvaluationScene.id;

    private preparation: Preparation;

    private recipeTitleNode: HTMLElement;

    constructor(game: Game) {
        super(game);

        this.preparation = null;

        this.recipeTitleNode = null;

        this.createRootElement();
    }

    protected createRootElement(): void {
        super.createRootElement();

        this.createTitleBar();
        this.createDishPicture();
        this.createCommentSection();
        this.createActionBar();
    }

    private createTitleBar(): void {
        const titleBar = document.createElement("div");
        titleBar.classList.add("title-bar");
        this.root.append(titleBar);

        // Recipe title
        const recipeTitle = document.createElement("h2");
        recipeTitle.classList.add("recipe-title");
        titleBar.append(recipeTitle);

        this.recipeTitleNode = recipeTitle;
    }

    private createDishPicture(): void {
        const dishPicture = document.createElement("div");
        dishPicture.classList.add("dish-picture");
        this.root.append(dishPicture);  
    }

    private createCommentSection(): void {
        const commentSection = document.createElement("div");
        commentSection.classList.add("comment-section");
        this.root.append(commentSection); 
    }

    private createActionBar(): void {
        const actionBar = document.createElement("div");
        actionBar.classList.add("action-bar");
        this.root.append(actionBar);

        // Title screen button
        const titleScreenButton = document.createElement("button");
        titleScreenButton.textContent = "Title screen";
        titleScreenButton.classList.add("title-screen-button");
        titleScreenButton.addEventListener("click", () => {
            EventManager.emit(new DisplayTitleScreenEvent());
        });
        actionBar.append(titleScreenButton);

        // Next recipe button
        const recipeListButton = document.createElement("button");
        recipeListButton.textContent = "Recipes";
        recipeListButton.classList.add("recipes-button");
        recipeListButton.addEventListener("click", () => {
            const targetRecipe = this.game.getRandomUnlockedRecipe();
            EventManager.emit(new StartCookingEvent(targetRecipe));
        });
        actionBar.append(recipeListButton);
    }

    beforeMount(): void {
        // Update the title
        const preparationName = this.game.currentPreparation.targetRecipe.name;
        this.recipeTitleNode.innerText = preparationName;

        // Update the dish picture
        // TODO

        // Update the comment
        // TODO
    }
}