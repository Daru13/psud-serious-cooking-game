export type IngredientName = string;

interface SerialisedIngredient {
    name: string;
}

export class Ingredient {
    readonly name: IngredientName;
    
    private constructor(name: string) {
        this.name = name;
    }

    static fromSerialisedIngredient(obj: SerialisedIngredient): Ingredient {
        return new Ingredient(obj.name);
    }
}