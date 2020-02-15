import { SceneID, Scene } from './Scene';

export class RecipeCookingScene extends Scene {
    id: SceneID = "recipe-cooking";

    constructor() {
        super();
        this.createRootElement();
    }

    protected createRootElement(): void {
        super.createRootElement();

        // TODO
    }
}