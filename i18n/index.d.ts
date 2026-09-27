// Types of index.js for the TypeScript server. The texts are plain JSON; the engine checks their shape.
export declare const TEXTS: Record<string, any>;
export declare const LANGUAGES: readonly [string, ...string[]];
export declare function byLang<T>(pick: (text: any) => T): Record<string, T>;
export declare const LANGUAGE_NAMES: Record<string, string>;
