export type SceneID = string;

export abstract class Scene {
    abstract id: SceneID;
    protected root: HTMLElement;
    protected mounted: boolean;
    
    constructor() {
        this.root = null;
        this.mounted = false;
    }

    protected createRootElement() {
        this.root = document.createElement("div");
        this.root.setAttribute("id", this.id);
        this.root.classList.add("scene");
    }

    mount(parent: HTMLElement): void {
        if (this.mounted) {
            return;
        }

        parent.append(this.root);
        this.mounted = true;
    };
    
    unmount(): void {
        if (!this.mounted) {
            return;
        }
        
        this.root.parentElement.removeChild(this.root);
        this.mounted = false;
    }
}