interface Count<T> {
    key: T;
    count: number;
}

export type Counts<T> = Count<T>[];

export class MapCounter<T = any> {
    private counters: Map<T, number>;

    constructor(keys: T[] = [], initialValue = 0) {
        this.counters = new Map();
        this.init(keys, initialValue);
    }

    private init(keys: T[], value: number): void {
        for (let key of keys) {
            this.set(key, value);
        }
    }

    has(key: T): boolean {
        return this.counters.has(key);
    }

    zero(key: T): void {
        this.counters.set(key, 0);
    }

    set(key: T, value: number, relative = false): void {
        if (! this.counters.has(key)) {
            this.zero(key);
        }

        if (relative) {
            const currentCount = this.counters.get(key);
            this.counters.set(key, currentCount + value);
        }
        else {
            this.counters.set(key, value);
        }
    }

    increment(key: T, by: number = 1): void {
        this.set(key, by, true);
    }

    decrement(key: T, by: number = 1): void {
        this.set(key, -by, true);
    }

    getCountOf(key: T): number {
        if (! this.counters.has(key)) {
            return 0;
        }

        return this.counters.get(key);
    }

    getAllCounts(): Counts<T> {
        return [...this.counters.entries()]
            .map(([key, count]) => {
                return { key, count };
            });
    }
}