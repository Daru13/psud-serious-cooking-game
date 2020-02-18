import { PlayerProgress } from './PlayerProgress';
import { Renderer } from './rendering/Renderer';
import { Preparation } from './data/Preparation';

export class Game {
    private renderer: Renderer;
    private progress: PlayerProgress;
    currentPreparation: Preparation;

    constructor() {
        this.renderer = new Renderer(this);
        this.progress = PlayerProgress.loadFromLocalStorageOrCreate();
        this.currentPreparation = null;

        console.log("Game initialised!");
    }
}