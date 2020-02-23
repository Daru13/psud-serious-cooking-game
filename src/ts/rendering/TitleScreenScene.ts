import { Scene, SceneID } from './Scene';
import { Game } from '../Game';
import { EventManager } from '../events/EventManager';
import { StartCookingEvent } from '../events/StartCookingEvent';
import { DisplayRecipeListEvent } from '../events/DisplayRecipeListEvent';

export class TitleScreenScene extends Scene {
    static id: SceneID = "title-screen";
    id: SceneID = TitleScreenScene.id;

    private coinCounterNode: HTMLElement;
    private trophyCounterNode: HTMLElement;

    constructor(game: Game) {
        super(game);

        this.coinCounterNode = null;
        this.trophyCounterNode = null;

        this.createRootElement();
    }

    protected createRootElement(): void {
        super.createRootElement();

        this.createMainTitle();
        this.createMainMenu();
        this.createStatsBar();
    }

    private createMainTitle(): void {
        const title = document.createElement("h1");
        title.textContent = "Healthy Chef";
        title.classList.add("main-title");
        this.root.append(title);
    }

    private createMainMenu(): void {
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

    private createStatsBar(): void {
        const statsBar = document.createElement("div");
        statsBar.classList.add("stats-bar");
        this.root.append(statsBar);

        const coinCounter = document.createElement("div");
        coinCounter.classList.add("coin-counter");
        statsBar.append(coinCounter);

        const trophyCounter = document.createElement("div");
        trophyCounter.classList.add("trophy-counter");
        statsBar.append(trophyCounter);

        this.coinCounterNode = coinCounter;
        this.trophyCounterNode = trophyCounter;
    }

    private updateCounters(): void {
        const progress = this.game.progress;

        this.coinCounterNode.innerText = progress
            .getNbCoins()
            .toFixed(0);

        this.trophyCounterNode.innerText = progress
            .getNbTrophies()
            .toFixed(0);
    }

    beforeMount(): void {
        this.updateCounters();
    }
}