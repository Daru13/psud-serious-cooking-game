import interact from "interactjs";

import { SceneID, Scene } from './Scene';
import { Recipe } from '../data/Recipe';
import { Ingredient, IngredientName } from '../data/Ingredient';
import { Game } from '../Game';
import { emptyElement } from '../utils/DOMUtils';
import { EventManager } from '../events/EventManager';
import { FinishCookingEvent } from '../events/FinishCookingEvent';
import { DisplayTitleScreenEvent } from '../events/DisplayTitleScreenEvent';

export class RecipeCookingScene extends Scene {
    static id: SceneID = "recipe-cooking";
    id: SceneID = RecipeCookingScene.id;

    private elapsedSeconds: number;
    private timerInterval: number;
    private draggedIngredientName: IngredientName | null;

    private timerNode: HTMLElement;
    private doneButtonNode: HTMLButtonElement;
    private recipeTitleNode: HTMLHeadingElement;
    private preparationPictureNode: HTMLElement;
    private ingredientListNode: HTMLElement;
    private draggedIngredientNode: HTMLElement;

    constructor(game: Game) {
        super(game);

        this.elapsedSeconds = 0;
        this.timerInterval = -1;
        this.draggedIngredientName = null;

        this.timerNode = null;
        this.doneButtonNode = null;
        this.recipeTitleNode = null;
        this.preparationPictureNode = null;
        this.ingredientListNode = null;
        this.draggedIngredientNode = null;

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

        // Title screen button
        const titleScreenButton = document.createElement("button");
        titleScreenButton.type = "button";
        titleScreenButton.textContent = "Title screen";
        titleScreenButton.classList.add("title-screen-button");
        titleScreenButton.addEventListener("click", () => {
            EventManager.emit(new DisplayTitleScreenEvent());
        });
        titleBar.append(titleScreenButton);

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

            ondragenter: () => {
                if (! this.game.currentPreparation.contains(this.draggedIngredientName)) {
                    ingredientDropZone.classList.add("drop-enabled");
                }
            },
            ondragleave: () => { ingredientDropZone.classList.remove("drop-enabled"); },
            ondrop: () => {
                const ingredientName = this.draggedIngredientName;
                this.draggedIngredientName = null;

                ingredientDropZone.classList.remove("drop-enabled");
    
                this.game.currentPreparation.use(ingredientName);
                this.updateIngredient(ingredientName);
                this.updateMixedIngredientsCount();
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

    private updateRecipeContainerPicture(): void {
        const recipeContainer = this.game.currentPreparation.targetRecipe.container;
        this.preparationPictureNode.setAttribute("data-container", recipeContainer);
    }

    private updateMixedIngredientsCount(): void {
        const mixedIngredientsCount = document.createElement("span");
        mixedIngredientsCount.innerText = this.game.currentPreparation
            .getNbMixedIngredients()
            .toFixed(0);
        
        emptyElement(this.preparationPictureNode);
        this.preparationPictureNode.append(mixedIngredientsCount);
    }

    private updateIngredientList(): void {
        const availableIngredientNames = this.game.currentPreparation
            .getAllAvailableIngredients();

        emptyElement(this.ingredientListNode);
        for (let ingredientName of availableIngredientNames) {
            const ingredient = document.createElement("div");
            ingredient.innerText = ingredientName;
            ingredient.classList.add("ingredient");
            ingredient.setAttribute("data-ingredient", ingredientName);
            
            interact(ingredient).draggable({
                listeners: {
                    start: (event: MouseEvent) => {
                        const alreadyUsed = this.game.currentPreparation.contains(ingredientName);
                        this.draggedIngredientName = ingredientName;

                        const draggedIngredient = document.createElement("div");
                        draggedIngredient.classList.add("dragged-ingredient");
                        draggedIngredient.classList.toggle("already-used", alreadyUsed);
                        draggedIngredient.setAttribute("data-ingredient", ingredientName);
                        document.body.append(draggedIngredient);

                        this.draggedIngredientNode = draggedIngredient;
                        this.updateDraggedIngredient(event);
                    },

                    move: (event: MouseEvent) => {
                        this.updateDraggedIngredient(event);
                    },

                    end: () => {
                        document.body.removeChild(this.draggedIngredientNode);
                        this.draggedIngredientNode = null;
                    }
                },

                cursorChecker: (_a, _i, _e, interacting) => {
                    return interacting ? "grabbing" : "grab";
                }
            })
            .on("click", () => {
                if (this.game.currentPreparation.contains(ingredientName)) {
                    this.game.currentPreparation.takeBack(ingredientName);

                    this.updateIngredient(ingredientName);
                    this.updateMixedIngredientsCount();
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

    private updateDraggedIngredient(event: MouseEvent): void {
        const draggedIngredient = this.draggedIngredientNode;

        const boundingBox = draggedIngredient.getBoundingClientRect();
        draggedIngredient.style.top = `${Math.round(event.clientY - (boundingBox.height / 2))}px`;
        draggedIngredient.style.left = `${Math.round(event.clientX - (boundingBox.width / 2))}px`;
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
        this.updateRecipeContainerPicture();
        this.updateMixedIngredientsCount();

        // Update the list of ingredients
        this.updateIngredientList();
    }

    afterMount(): void {
        // Start the timer
        this.elapsedSeconds = 0;
        this.timerInterval = window.setInterval(() => {
            this.elapsedSeconds += 1;
            this.updateTimer();
        }, 1000);
    }

    beforeUnmount(): void {
        // Stop the timer
        window.clearInterval(this.timerInterval);
    }
}