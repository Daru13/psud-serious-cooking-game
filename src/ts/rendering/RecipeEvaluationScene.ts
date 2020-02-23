import { SceneID, Scene } from './Scene';
import { Game } from '../Game';
import { Preparation } from '../data/Preparation';
import { EventManager } from '../events/EventManager';
import { DisplayTitleScreenEvent } from '../events/DisplayTitleScreenEvent';
import { StartCookingEvent } from '../events/StartCookingEvent';
import { emptyElement } from '../utils/DOMUtils';
import { IngredientEffectType } from '../data/Recipe';

export class RecipeEvaluationScene extends Scene {
    static id: SceneID = "recipe-evaluation";
    id: SceneID = RecipeEvaluationScene.id;

    private preparation: Preparation;

    private recipeTitleNode: HTMLElement;
    private dishPictureNode: HTMLElement;
    private rewardNode: HTMLElement;
    private commentListNode: HTMLUListElement;

    constructor(game: Game) {
        super(game);

        this.preparation = null;

        this.recipeTitleNode = null;
        this.dishPictureNode = null;
        this.rewardNode = null;
        this.commentListNode = null;

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

        this.dishPictureNode = dishPicture;
    }

    private createCommentSection(): void {
        const commentSection = document.createElement("div");
        commentSection.classList.add("comment-section");
        this.root.append(commentSection);

        const reward = document.createElement("div");
        reward.classList.add("reward");
        commentSection.append(reward);

        const commentList = document.createElement("ul");
        commentList.classList.add("comment-list");
        commentSection.append(commentList);

        this.rewardNode = reward;
        this.commentListNode = commentList;
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

        // Play again button
        const playAgainButton = document.createElement("button");
        playAgainButton.textContent = "Play again";
        playAgainButton.classList.add("play-again-button");
        playAgainButton.addEventListener("click", () => {
            const targetRecipe = this.game.currentPreparation.targetRecipe;
            EventManager.emit(new StartCookingEvent(targetRecipe));
        });
        actionBar.append(playAgainButton);

        // Next recipe button
        const nextRecipeButton = document.createElement("button");
        nextRecipeButton.textContent = "Next recipe";
        nextRecipeButton.classList.add("next-recipe-button");
        nextRecipeButton.addEventListener("click", () => {
            const targetRecipe = this.game.getRandomUnlockedRecipe();
            EventManager.emit(new StartCookingEvent(targetRecipe));
        });
        actionBar.append(nextRecipeButton);
    }

    private updateReward(): void {
        const reward = this.game.currentPreparation.computeReward();
        this.rewardNode.innerText = reward.toString();
    }

    private updateComments(): void {
        const triggeredEffects = this.game.currentPreparation.getTriggeredEffects();

        emptyElement(this.commentListNode);
        for (let effect of triggeredEffects) {
            if (effect.reason === undefined) {
                continue;
            }

            const commentType = effect.type === IngredientEffectType.Positive ? "positive"
                              : effect.type === IngredientEffectType.Negative ? "negative"
                              : "neutral";

            const comment = document.createElement("li");
            comment.classList.add("comment", commentType);
            comment.innerText = effect.reason;
            this.commentListNode.append(comment);
        }
    }

    beforeMount(): void {
        // Update the title
        const preparationName = this.game.currentPreparation.targetRecipe.name;
        this.recipeTitleNode.innerText = preparationName;

        // Update the dish picture
        this.dishPictureNode.setAttribute("data-recipe", this.game.currentPreparation.targetRecipe.name);

        // Update the reward and the comments
        this.updateReward();
        this.updateComments();
    }
}