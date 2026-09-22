import { Texture, TextureSource } from 'pixi.js';
import { describe, expect, it, vi } from 'vitest';
import { ExtendedSprite } from './ExtendedSprite';

vi.mock('@octane/utils', () => ({
    GetRenderer: () => null,
    TextureUtils: {}
}));

const makeTexture = (): Texture => new Texture({ source: new TextureSource({ width: 4, height: 4 }) });

describe('ExtendedSprite texture lifecycle', () =>
{
    it('falls back to Texture.EMPTY when its texture is destroyed', () =>
    {
        const texture = makeTexture();
        const sprite = new ExtendedSprite({ texture });

        expect(sprite.needsUpdate(1, 1)).toBe(true);

        texture.destroy(true);

        expect(sprite.texture).toBe(Texture.EMPTY);
        expect(sprite.needsUpdate(1, 1)).toBe(true);
    });

    it('stops listening to a texture it no longer shows', () =>
    {
        const first = makeTexture();
        const second = makeTexture();
        const sprite = new ExtendedSprite({ texture: first });

        sprite.setTexture(second);

        expect(first.listenerCount('destroy')).toBe(0);
        expect(second.listenerCount('destroy')).toBe(1);

        first.destroy(true);

        expect(sprite.texture).toBe(second);

        sprite.destroy();

        expect(second.listenerCount('destroy')).toBe(0);
        expect(second.destroyed).toBe(false);
    });

    it('never subscribes to Texture.EMPTY', () =>
    {
        const before = Texture.EMPTY.listenerCount('destroy');
        const sprite = new ExtendedSprite();

        sprite.setTexture(makeTexture());
        sprite.setTexture(null);

        expect(sprite.texture).toBe(Texture.EMPTY);
        expect(Texture.EMPTY.listenerCount('destroy')).toBe(before);
    });
});
