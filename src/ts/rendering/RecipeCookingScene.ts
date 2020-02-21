import interact from "interactjs";

import { SceneID, Scene } from './Scene';
import { Recipe } from '../data/Recipe';
import { Ingredient, IngredientName } from '../data/Ingredient';
import { Game } from '../Game';
import { emptyElement } from '../utils/DOMUtils';
import { EventManager } from '../events/EventManager';
import { FinishCookingEvent } from '../events/FinishCookingEvent';

export class RecipeCookingScene extends Scene {
    static id: SceneID = "recipe-cooking";
    id: SceneID = RecipeCookingScene.id;

    private isPaused: boolean;
    private elapsedSeconds: number;
    private timerInterval: number;
    private draggedIngredientName: IngredientName | null;

    private timerNode: HTMLElement;
    private doneButtonNode: HTMLButtonElement;
    private recipeTitleNode: HTMLHeadingElement;
    private preparationPictureNode: HTMLElement;
    private ingredientListNode: HTMLElement;

    constructor(game: Game) {
        super(game);

        this.isPaused = false;
        this.elapsedSeconds = 0;
        this.timerInterval = -1;
        this.draggedIngredientName = null;

        this.timerNode = null;
        this.doneButtonNode = null;
        this.recipeTitleNode = null;
        this.preparationPictureNode = null;
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
            this.isPaused = !this.isPaused;
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
            EventManager.emit(new FinishCookingEvent());
        });
        titleBar.append(doneButton);

        this.timerNode = timer;
        this.doneButtonNode = doneButton;
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

        interact(ingredientDropZone).dropzone({
            accept: ".ingredient",

            ondragenter: () => { ingredientDropZone.classList.add("drop-enabled"); },
            ondragleave: () => { ingredientDropZone.classList.remove("drop-enabled"); },
            ondrop: () => {
                const ingredientName = this.draggedIngredientName;
                this.draggedIngredientName = null;

                ingredientDropZone.classList.remove("drop-enabled");
    
                this.game.currentPreparation.use(ingredientName);
                this.updateIngredient(ingredientName);
                this.updateDoneButton();
            },
        });

        // Preparation picture
        const preparationPicture = document.createElement("div");
        preparationPicture.classList.add("preparation-picture");
        ingredientDropZone.append(preparationPicture);

        this.preparationPictureNode = preparationPicture;
    }

    private createIngredientList(): void {
        const ingredientList = document.createElement("div");
        ingredientList.classList.add("ingredient-list");
        this.root.append(ingredientList); 
        
        this.ingredientListNode = ingredientList;
    }

    private updateTimer(): void {
        const minutes = Math.floor(this.elapsedSeconds / 60)
        const seconds = this.elapsedSeconds % 60;

        const minutesString = minutes.toFixed(0);
        const secondsString = (seconds < 10 ? "0" : "") + seconds.toFixed(0);
        const timerString = `${minutesString}:${secondsString}`;

        this.timerNode.innerText = timerString;
    }

    private updatePreparationPicture(): void {
        const recipeName = this.game.currentPreparation.targetRecipe.name;
        this.preparationPictureNode.setAttribute("data-recipe", recipeName);
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
            ingredient.setAttribute("data-ingredient", ingredientName);
            
            interact(ingredient).draggable({
                listeners: {
                    start: () => {
                        this.draggedIngredientName = ingredientName;
                    },

                    move(event) {
                        // TODO
                    }
                }
            })
            .on("click", () => {
                if (this.game.currentPreparation.contains(ingredientName)) {
                    this.game.currentPreparation.takeBack(ingredientName);

                    this.updateIngredient(ingredientName);
                    this.updateDoneButton();
                }
            });

            this.ingredientListNode.append(ingredient);   
        }
    }

    private updateIngredient(ingredientName: IngredientName) {
        const ingredient = this.ingredientListNode
            .querySelector(`*[data-ingredient="${ingredientName}"]`) as HTMLElement;

        const alreadyUsed = this.game.currentPreparation.contains(ingredientName);
        ingredient.classList.toggle("already-used", alreadyUsed);
    }

    private updateDoneButton() {
        this.doneButtonNode.disabled = !this.game.currentPreparation.isFinished();
    }

    beforeMount(): void {
        // Update the title bar
        const preparationName = this.game.currentPreparation.targetRecipe.name;
        this.recipeTitleNode.innerText = preparationName;
        this.updateDoneButton();

        // Update the cooking space
        this.updatePreparationPicture();

        // Update the list of ingredients
        this.updateIngredientList();
    }

    afterMount(): void {
        // Start the timer
        this.elapsedSeconds = 0;
        this.timerInterval = window.setInterval(() => {
            if (this.isPaused) {
                return;
            }

            this.elapsedSeconds += 1;
            this.updateTimer();
        }, 1000);
    }

    beforeUnmount(): void {
        // Stop the timer
        window.clearInterval(this.timerInterval);
    }
}