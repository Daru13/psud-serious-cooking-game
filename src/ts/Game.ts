import { PlayerProgress } from './PlayerProgress';
import { Renderer } from './rendering/Renderer';

export class Game {
    private renderer: Renderer;
    private progress: PlayerProgress;

    constructor() {
        this.renderer = new Renderer();
        this.progress = PlayerProgress.loadFromLocalStorageOrCreate();

        console.log("Game initialised!");
    }
}