export type ValueOrAccessor<Args extends unknown[], T> = T | ((...args: Args) => T);
