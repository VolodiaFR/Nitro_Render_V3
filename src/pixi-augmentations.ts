import 'pixi.js';

/**
 * `ExtendedSprite` caches a texture's alpha channel on the texture source itself,
 * so a pixel-perfect hit test does not have to re-read the pixels on every mouse
 * move: `hitMap` holds the bytes, `hitMapDirty` says they need regenerating, and
 * `hitMapTime` throttles how often that happens. `GraphicAssetPalette` fills the
 * same fields when it bakes a recoloured texture, and `TexturePool` deletes them
 * when it recycles or destroys one.
 *
 * None of the three belongs to PixiJS, so every one of those reads and writes
 * used to sit behind a `@ts-ignore`. That silences the whole line rather than the
 * one unknown property, which is why they were removed - declaring the fields
 * here does the same job without hiding anything else on those lines.
 *
 * All three are optional because `TexturePool` `delete`s them and `ExtendedSprite`
 * reads `hitMapTime` through `?? 0`.
 *
 * This file must stay a module - it imports 'pixi.js' for exactly that reason.
 * In a global script `declare module 'pixi.js'` would declare an ambient module
 * and shadow the real types instead of adding to them. The type parameter list
 * has to match the class declaration exactly, or the merge is rejected.
 */
declare module 'pixi.js'
{
    interface TextureSource<T extends Record<string, any> = any>
    {
        hitMap?: Uint8Array | Uint8ClampedArray;
        hitMapDirty?: boolean;
        hitMapTime?: number;
    }
}
