import { Scene, SceneID } from './Scene';
import { TitleScreenScene } from './TitleScreenScene';
import { Game } from '../Game';
import { RecipeCookingScene } from './RecipeCookingScene';
import { RecipeEvaluationScene } from './RecipeEvaluationScene';

export class Renderer {
    private static readonly CONTAINER_ID = "game-container";
    private container: HTMLElement;

    private readonly game: Game;

    private scenes: Map<SceneID, Scene>;
    private currentScene: Scene;

    constructor(game: Game) {
        this.container = document.getElementById(Renderer.CONTAINER_ID);

        this.game = game;

        this.scenes = new Map();
        this.currentScene = null;

        this.init();
    }

    private init(): void {
        this.initScenes();
        this.displayScene("title-screen");
    }

    private initScenes(): void {
        const scenes = [
            new TitleScreenScene(this.game),
            new RecipeCookingScene(this.game),
            new RecipeEvaluationScene(this.game),
        ];

        for (let scene of scenes) {
            this.scenes.set(scene.id, scene);
        }
    }

    displayScene(id: SceneID): void {
        if (! this.scenes.has(id)) {
            return;
        }

        if (this.currentScene !== null) {
            this.currentScene.beforeUnmount();
            this.currentScene.unmount();
            this.currentScene.afterUnmount();
        }

        const newScene = this.scenes.get(id);

        newScene.beforeMount();
        newScene.mount(this.container);
        newScene.afterMount();

        this.currentScene = newScene;
    }
}