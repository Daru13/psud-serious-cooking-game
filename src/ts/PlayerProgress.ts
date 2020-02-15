import { Recipe, RecipeName } from './data/Recipe';

export interface RecipeCookingLog {
    nbSuccesses: number;
    nbFailures: number;
}

interface SerialisedPlayerProgress {
    recipeCookingLogs: Record<RecipeName, RecipeCookingLog>;
    unlockedRecipeNames: RecipeName[];
}

export class PlayerProgress {
    private static readonly LOCAL_STORAGE_KEY = "playerProgress";

    private recipeCookingLogs: Map<RecipeName, RecipeCookingLog>;
    private unlockedRecipeNames: Set<RecipeName>;

    constructor() {
        this.recipeCookingLogs = new Map();
        this.unlockedRecipeNames = new Set();
    }

    private getOrCreateLog(recipe: Recipe): RecipeCookingLog {
        if (!this.recipeCookingLogs.has(recipe.name)) {
            this.recipeCookingLogs.set(recipe.name, {
                nbSuccesses: 0,
                nbFailures: 0
            });
        }

        return this.recipeCookingLogs.get(recipe.name);
    }

    getCookingLog(recipe: Recipe): Readonly<RecipeCookingLog> | null {
        return this.recipeCookingLogs.get(recipe.name) ?? null;
    }

    getUnlockedRecipeNames(): ReadonlySet<RecipeName> {
        return this.unlockedRecipeNames;
    }

    logCookingSuccess(recipe: Recipe): void {
        const log = this.getOrCreateLog(recipe);
        log.nbSuccesses += 1;
    }

    logCookingFailure(recipe: Recipe): void {
        const log = this.getOrCreateLog(recipe);
        log.nbFailures += 1;
    }

    unlockRecipe(recipe: Recipe): void {
        this.unlockedRecipeNames.add(recipe.name);
    }

    saveInLocalStorage(): void {
        const serialisedProgress: SerialisedPlayerProgress = {
            recipeCookingLogs: {},
            unlockedRecipeNames: []
        };

        for (let [recipeName, cookingLog] of this.recipeCookingLogs.entries()) {
            serialisedProgress.recipeCookingLogs[recipeName] = cookingLog;
        }
        for (let recipeName of this.unlockedRecipeNames.values()) {
            serialisedProgress.unlockedRecipeNames.push(recipeName);
        }

        localStorage.setItem(PlayerProgress.LOCAL_STORAGE_KEY, JSON.stringify(serialisedProgress));
    }

    static loadFromLocalStorageOrCreate(): PlayerProgress {
        const playerProgress = new PlayerProgress();
        
        const serialisedProgressCandidate = localStorage.getItem(PlayerProgress.LOCAL_STORAGE_KEY);
        if (serialisedProgressCandidate === null) {
            return playerProgress;
        }

        const serialisedProgress = JSON.parse(serialisedProgressCandidate) as SerialisedPlayerProgress;
        for (let recipeName in Object.keys(serialisedProgress.recipeCookingLogs)) {
            playerProgress.recipeCookingLogs.set(recipeName, serialisedProgress.recipeCookingLogs[recipeName]);
        }
        for (let recipeName in Object.keys(serialisedProgress.unlockedRecipeNames)) {
            playerProgress.unlockedRecipeNames.add(recipeName);
        }

        return playerProgress;
    }
}