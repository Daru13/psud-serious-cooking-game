import { Scene, SceneID } from './Scene';
import { Game } from '../Game';
import { EventManager } from '../events/EventManager';
import { RecipeCategory, RecipeName, Recipe } from '../data/Recipe';
import { DisplayTitleScreenEvent } from '../events/DisplayTitleScreenEvent';
import { StartCookingEvent } from '../events/StartCookingEvent';

export class RecipeListScene extends Scene {
    static id: SceneID = "recipe-list";
    id: SceneID = RecipeListScene.id;

    private recipeCategoryTitleNodes: Map<RecipeCategory, HTMLElement>;
    private recipeItemNodes: Map<RecipeName, HTMLElement>;

    constructor(game: Game) {
        super(game);

        this.recipeCategoryTitleNodes = new Map();
        this.recipeItemNodes = new Map();

        this.createRootElement();
    }

    protected createRootElement(): void {
        super.createRootElement();

        this.createTitleBar();
        this.createRecipeList();
    }

    private createTitleBar(): void {
        const titleBar = document.createElement("div");
        titleBar.classList.add("title-bar");
        this.root.append(titleBar);

        const titleScreenButton = document.createElement("button");
        titleScreenButton.textContent = "Title screen";
        titleScreenButton.classList.add("title-screen-button");
        titleScreenButton.addEventListener("click", () => {
            EventManager.emit(new DisplayTitleScreenEvent());
        });
        titleBar.append(titleScreenButton);

        const title = document.createElement("h2");
        title.textContent = "Recipes";
        title.classList.add("title");
        titleBar.append(title);
    }

    private createRecipeList(): void {
        const list = document.createElement("ul");
        list.classList.add("recipe-list");
        this.root.append(list);

        const groupedRecipes = this.game.data.getRecipesGroupedByCategory();
        for (let [categoryName, recipes] of groupedRecipes.entries()) {
            this.createRecipeCategory(list, categoryName, recipes);
        }
    }

    private createRecipeCategory(parent: HTMLElement, title: string, recipes: Recipe[]): void {
        const category = document.createElement("div");
        category.classList.add("recipe-category");
        parent.append(category);

        // Title of the category (with trophy icon if any)
        const categoryTitle = document.createElement("h3");
        categoryTitle.classList.add("category-title");
        categoryTitle.innerText = title;
        category.append(categoryTitle);

        // Content of the category
        const recipeItemList = document.createElement("ul");
        recipeItemList.classList.add("recipe-item-list");
        category.append(recipeItemList);

        for (let recipe of recipes) {
            this.createRecipeItem(recipeItemList, recipe);
        }

        this.recipeCategoryTitleNodes.set(title, categoryTitle);
    }

    private createRecipeItem(parent: HTMLElement, recipe: Recipe): void {
        const recipeItem = document.createElement("li");
        recipeItem.classList.add("recipe-item");
        parent.append(recipeItem);

        const recipeItemButton = document.createElement("button");
        recipeItemButton.innerText = recipe.name;
        recipeItemButton.addEventListener("click", () => {
            EventManager.emit(new StartCookingEvent(recipe));
        });
        recipeItem.append(recipeItemButton);

        this.recipeItemNodes.set(recipe.name, recipeItem);
    }

    private updateCategoryTitles(): void {
        // Remove all trophies
        for (let categoryTitle of this.recipeCategoryTitleNodes.values()) {
            categoryTitle.classList.remove("has-trophy");
        }

        // Add trophies to the right categories
        const categoriesWithTrophies = this.game.progress.getRecipeCategoriesWithTrophies();

        for (let categoryName of categoriesWithTrophies) {
            const categoryTitle = this.recipeCategoryTitleNodes.get(categoryName);
            categoryTitle.classList.add("has-trophy");
        }
    }

    private updateRecipeItems(): void {
        for (let [recipeName, recipeItem] of this.recipeItemNodes.entries()) {
            const hasStarBadge = this.game.progress.hasStarBadge(recipeName);
            recipeItem.classList.toggle("has-star-badge", hasStarBadge);

            const isUnlocked = this.game.progress.isUnlocked(recipeName);
            recipeItem.querySelector("button").disabled = !isUnlocked;
        }
    }

    beforeMount(): void {
        this.updateCategoryTitles();
        this.updateRecipeItems();
    }
}