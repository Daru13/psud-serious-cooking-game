import { Scene, SceneID } from './Scene';
import { TitleScreenScene } from './TitleScreenScene';

export class Renderer {
    private static readonly CONTAINER_ID = "game-container";

    private container: HTMLElement;

    private scenes: Map<SceneID, Scene>;
    private currentScene: Scene;

    constructor() {
        this.container = document.getElementById(Renderer.CONTAINER_ID);

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
            new TitleScreenScene()
        ];

        for (let scene of scenes) {
            this.scenes.set(scene.id, scene);
        }
    }

    private displayScene(id: SceneID): void {
        if (!this.scenes.has(id)) {
            return;
        }

        const newScene = this.scenes.get(id);

        this.currentScene?.unmount();
        newScene.mount(this.container);
        this.currentScene = newScene;
    }
}