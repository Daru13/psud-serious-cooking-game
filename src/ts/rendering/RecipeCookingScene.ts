import { SceneID, Scene } from './Scene';
import { Recipe } from '../data/Recipe';
import { Ingredient } from '../data/Ingredient';
import { Game } from '../Game';
import { emptyElement } from '../utils/DOMUtils';

export class RecipeCookingScene extends Scene {
    id: SceneID = "recipe-cooking";

    private recipe: Recipe;
    private ingredients: Ingredient[];

    private timerStartTimestamp: number;
    private timerInterval: number;

    private timerNode: HTMLElement;
    private recipeTitleNode: HTMLElement;
    private ingredientListNode: HTMLElement;

    constructor(game: Game) {
        super(game);

        this.recipe = null;
        this.ingredients = [];
        this.timerInterval = -1;

        this.timerNode = null;
        this.recipeTitleNode = null;
        this.ingredientListNode = null;

        this.createRootElement();
    }

    protected createRootElement(): void {
        super.createRootElement();

        this.createTitleBar();
        this.createCookingSpace();
        this.createIngredientList();
    }

    private createTitleBar(): void {
        const titleBar = document.createElement("div");
        titleBar.classList.add("title-bar");
        this.root.append(titleBar);

        // Pause button
        const pauseButton = document.createElement("button");
        pauseButton.type = "button";
        pauseButton.textContent = "Pause";
        pauseButton.classList.add("pause-button");
        pauseButton.addEventListener("click", () => {
            // TODO: implement the pause
            console.log("Pause button was pressed");
        });
        titleBar.append(pauseButton);

        // Recipe title
        const recipeTitle = document.createElement("h2");
        recipeTitle.classList.add("recipe-title");
        titleBar.append(recipeTitle);

        // Timer
        const timer = document.createElement("div");
        timer.textContent = "0:00";
        timer.classList.add("timer");
        titleBar.append(timer);

        // Done button
        const doneButton = document.createElement("button");
        doneButton.type = "button";
        doneButton.textContent = "Done";
        doneButton.classList.add("done-button");
        doneButton.addEventListener("click", () => {
            // TODO: implement the done
            console.log("Done button was pressed");
        });
        titleBar.append(doneButton);

        this.timerNode = timer;
        this.recipeTitleNode = recipeTitle;
    }

    private createCookingSpace(): void {
        const cookingSpace = document.createElement("div");
        cookingSpace.classList.add("cooking-space");
        this.root.append(cookingSpace);

        // Drop zone
        const ingredientDropZone = document.createElement("div");
        ingredientDropZone.classList.add("ingredient-drop-zone");
        cookingSpace.append(ingredientDropZone);    
    }

    private createIngredientList(): void {
        const ingredientList = document.createElement("div");
        ingredientList.classList.add("ingredient-list");
        this.root.append(ingredientList); 
        
        this.ingredientListNode = ingredientList;
    }

    private updateTimer(currentTimestamp: number): void {
        const diffInSeconds = (currentTimestamp - this.timerStartTimestamp) * 1000;
        
        const minutes = Math.floor(diffInSeconds / 60)
        const seconds = diffInSeconds % 60;

        const minutesString = minutes.toFixed(0);
        const secondsString = (seconds < 10 ? "0" : "") + seconds.toFixed(0);
        const timerString = `${minutesString}:${secondsString}`;

        this.timerNode.innerText = timerString;
    }

    private updateIngredientList(): void {
        const availableIngredientNames = this.game.currentPreparation
            .getAllAvailableIngredients()
            .map(count => count.key);
    
        emptyElement(this.ingredientListNode);
        for (let ingredientName of availableIngredientNames) {
            const ingredient = document.createElement("div");
            ingredient.innerText = ingredientName;
            ingredient.classList.add("ingredient");
            this.ingredientListNode.append(ingredient);   
        }
    }

    beforeMount(): void {
        // Update the title
        const preparationName = this.game.currentPreparation.targetRecipe.name;
        this.recipeTitleNode.innerText = preparationName;

        // Update the list of ingredients
        this.updateIngredientList();
    }

    afterMount(): void {
        // Start the timer
        this.timerStartTimestamp = Date.now();
        this.timerInterval = window.setInterval(() => {
            this.updateTimer(Date.now());
        }, 1000);
    }

    beforeUnmount(): void {
        // Stop the timer
        window.clearInterval(this.timerInterval);
    }
}