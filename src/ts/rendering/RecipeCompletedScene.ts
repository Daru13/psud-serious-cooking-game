import { SceneID, Scene } from './Scene';

export class RecipeCompletedScene extends Scene {
    id: SceneID = "recipe-completed";

    constructor() {
        super();
        this.createRootElement();
    }

    protected createRootElement(): void {
        super.createRootElement();

        // TODO
    }
}