import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Texture } from 'pixi.js';
import { TexturePool } from '../TexturePool';

vi.mock('@octane/utils', () => ({
    OctaneLogger: { log: vi.fn(), warn: vi.fn(), error: vi.fn() },
    TextureUtils: {
        createRenderTexture: vi.fn((width: number, height: number) => makeTexture(width, height))
    }
}));

const makeTexture = (width: number, height: number): Texture =>
{
    const texture = {
        width,
        height,
        destroyed: false,
        source: { hitMap: null, hitMapDirty: false },
        destroy: vi.fn(function(this: { destroyed: boolean })
        {
            this.destroyed = true;
        })
    };

    return texture as unknown as Texture;
};

const runTimes = (pool: TexturePool, count: number) =>
{
    for(let i = 0; i < count; i++) pool.run();
};

describe('TexturePool', () =>
{
    let pool: TexturePool;

    beforeEach(() =>
    {
        pool = new TexturePool();
    });

    it('hands a pooled texture back for the same size', () =>
    {
        const texture = makeTexture(32, 16);

        pool.putTexture(texture);

        expect(pool.getTotalTextures()).toBe(1);
        expect(pool.getTexture(32, 16)).toBe(texture);
        expect(pool.getTotalTextures()).toBe(0);
    });

    it('creates a fresh texture when nothing pooled matches', () =>
    {
        pool.putTexture(makeTexture(32, 16));

        const texture = pool.getTexture(64, 64);

        expect(texture.width).toBe(64);
        expect(texture.height).toBe(64);
        expect(pool.getTotalTextures()).toBe(1);
    });

    it('releases a texture that sat idle in the pool for longer than MAX_IDLE runs', () =>
    {
        const texture = makeTexture(32, 16);

        pool.putTexture(texture);
        runTimes(pool, 1800);

        expect(texture.destroy).not.toHaveBeenCalled();
        expect(pool.getTotalTextures()).toBe(1);

        pool.run();

        expect(texture.destroy).toHaveBeenCalledWith(true);
        expect(pool.getTotalTextures()).toBe(0);
        expect(pool.textures[32][16]).toHaveLength(0);
    });

    it('measures idle time from when the texture was last pooled, not from pool start', () =>
    {
        runTimes(pool, 5000);

        const texture = makeTexture(8, 8);

        pool.putTexture(texture);
        runTimes(pool, 1800);

        expect(texture.destroy).not.toHaveBeenCalled();

        pool.run();

        expect(texture.destroy).toHaveBeenCalledTimes(1);
    });

    it('restarts the idle clock when a texture is taken out and pooled again', () =>
    {
        const texture = makeTexture(8, 8);

        pool.putTexture(texture);
        runTimes(pool, 1000);

        expect(pool.getTexture(8, 8)).toBe(texture);

        runTimes(pool, 1000);
        pool.putTexture(texture);
        runTimes(pool, 1000);

        expect(texture.destroy).not.toHaveBeenCalled();

        runTimes(pool, 801);

        expect(texture.destroy).toHaveBeenCalledTimes(1);
    });

    it('destroys instead of pooling once the pool is full', () =>
    {
        for(let i = 0; i < 200; i++) pool.putTexture(makeTexture(1, i));

        const extra = makeTexture(2, 2);

        pool.putTexture(extra);

        expect(extra.destroy).toHaveBeenCalledWith(true);
        expect(pool.getTotalTextures()).toBe(200);
    });

    it('ignores destroyed or sourceless textures', () =>
    {
        const destroyed = makeTexture(4, 4);

        (destroyed as unknown as { destroyed: boolean }).destroyed = true;
        pool.putTexture(destroyed);
        pool.putTexture(null);

        expect(pool.getTotalTextures()).toBe(0);
    });
});
