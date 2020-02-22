import { RecipeName, RecipeCategory } from './data/Recipe';
import { GameData } from './data/GameData';
import { MapCounter, Counts } from './utils/MapCounter';
import { PreparationQuality, Preparation } from './data/Preparation';

export interface RecipeDetails {
    recipeName: RecipeName;
    isUnlocked: boolean;
    hasStarBadge: boolean;
    nbPreparations: number;
    preparationQualityCounts: MapCounter<PreparationQuality>;
}

interface SerialisedRecipeDetails {
    recipeName: RecipeName;
    isUnlocked: boolean;
    hasStarBadge: boolean;
    nbPreparations: number;
    preparationQualityCounts: Counts<PreparationQuality>;    
}

interface SerialisedPlayerProgress {
    nbCoins: number;
    recipeDetails: SerialisedRecipeDetails[];
}

export class PlayerProgress {
    private static readonly LOCAL_STORAGE_KEY = "playerProgress";

    private gameData: GameData;

    private nbCoins: number;
    private recipeDetails: Map<RecipeName, RecipeDetails>;

    private constructor(gameData: GameData, initialise = true) {
        this.gameData = gameData;

        this.nbCoins = 0;
        this.recipeDetails = new Map();

        if (initialise) {
            // Unlock all recipes which are available by default
            this.unlockDefaultRecipes();
        }
    }

    getNbCoins(): number {
        return this.nbCoins;
    }

    getRecipeCategoriesWithTrophies(): RecipeCategory[] {
        // Players get one trophy once they have cooked
        // all the recipes of one category with Perfect quality
        const groupedRecipes = this.gameData.getRecipesGroupedByCategory();

        return [...groupedRecipes.entries()]
            .filter(([_, recipes]) =>
                recipes.every((recipe) => this.getRecipeDetails(recipe.name).hasStarBadge)
            )
            .map(([categoryName, _]) => categoryName);
    }

    getNbTrophies(): number {
        return this.getRecipeCategoriesWithTrophies().length;
    }

    getRecipeDetails(recipeName: RecipeName): RecipeDetails {
        if (! this.recipeDetails.has(recipeName)) {
            this.recipeDetails.set(recipeName, {
                recipeName: recipeName,
                isUnlocked: false,
                hasStarBadge: false,
                nbPreparations: 0,
                preparationQualityCounts: new MapCounter()
            });
        }

        return this.recipeDetails.get(recipeName);
    }

    isUnlocked(recipeName: RecipeName): boolean {
        return this.getRecipeDetails(recipeName).isUnlocked;
    }

    getUnlockedRecipeNames(): RecipeName[] {
        return [...this.recipeDetails.values()]
            .filter(details => details.isUnlocked)
            .map(details => details.recipeName);
    }

    hasStarBadge(recipeName: RecipeName): boolean {
        return this.getRecipeDetails(recipeName).hasStarBadge;
    }

    getStaredRecipeNames(): RecipeName[] {
        return [...this.recipeDetails.values()]
        .filter(details => details.hasStarBadge)
        .map(details => details.recipeName);
    }

    logPreparation(preparation: Preparation): void {
        const details = this.getRecipeDetails(preparation.targetRecipe.name);

        const reward = preparation.computeReward();
        this.nbCoins += reward;

        const quality = preparation.computeQuality();
        details.nbPreparations += 1;
        details.preparationQualityCounts.increment(quality);

        if (quality === PreparationQuality.Perfect) {
            details.hasStarBadge = true;
        }

        this.saveInLocalStorage();
    }
    
    unlockRecipe(recipeName: RecipeName): void {
        const details = this.getRecipeDetails(recipeName);
        details.isUnlocked = true;

        this.saveInLocalStorage();
    }

    private unlockDefaultRecipes(): void {
        for (let recipeName of this.gameData.initiallyAvailableRecipeNames) {
            this.unlockRecipe(recipeName);
        }
    }

    saveInLocalStorage(): void {
        const serialisedProgress: SerialisedPlayerProgress = {
            nbCoins: this.nbCoins,
            recipeDetails: [],
        };

        for (let details of this.recipeDetails.values()) {
            serialisedProgress.recipeDetails.push({
                recipeName: details.recipeName,
                isUnlocked: details.isUnlocked,
                hasStarBadge: details.hasStarBadge,
                nbPreparations: details.nbPreparations,
                preparationQualityCounts: details.preparationQualityCounts.getAllCounts()
            });
        }

        localStorage.setItem(PlayerProgress.LOCAL_STORAGE_KEY, JSON.stringify(serialisedProgress));
    }

    static loadFromLocalStorageOrCreate(gameData: GameData): PlayerProgress {
        const serialisedProgressCandidate = localStorage.getItem(PlayerProgress.LOCAL_STORAGE_KEY);
        console.log(serialisedProgressCandidate);
        if (serialisedProgressCandidate === null) {
            return new PlayerProgress(gameData, true);
        }

        const playerProgress = new PlayerProgress(gameData, false);
        const serialisedProgress = JSON.parse(serialisedProgressCandidate) as SerialisedPlayerProgress;
        
        // Coins
        playerProgress.nbCoins = serialisedProgress.nbCoins;

        // Recipe details
        for (let serialisedDetails of serialisedProgress.recipeDetails) {
            const details = playerProgress.getRecipeDetails(serialisedDetails.recipeName);

            details.isUnlocked = serialisedDetails.isUnlocked;
            details.hasStarBadge = serialisedDetails.hasStarBadge;
            details.nbPreparations = serialisedDetails.nbPreparations;
            
            for (let {key, count} of serialisedDetails.preparationQualityCounts) {
                details.preparationQualityCounts.set(key, count);
            }
        }

        return playerProgress;
    }
}