export type IngredientName = string;

export class Ingredient {
    readonly name: IngredientName;
    
    private constructor(name: string) {
        this.name = name;
    }
}