import { describe, expect, it, vi } from 'vitest';
import { RoomSpriteCanvas } from './RoomSpriteCanvas';

vi.mock('@octane/utils', () => ({
    GetTicker: () => ({ deltaTime: 1 }),
    TextureUtils: {},
    Vector3d: class
    {
        constructor(public x: number = 0, public y: number = 0, public z: number = 0)
        {}
    }
}));

vi.mock('@octane/configuration', () => ({
    GetConfiguration: () => ({ getValue: (_key: string, fallback: unknown) => fallback })
}));

vi.mock('../utils', () => ({
    RoomEnterEffect: { isVisualizationOn: () => false },
    RoomGeometry: class
    {},
    RoomRotatingEffect: {},
    RoomShakingEffect: {}
}));

const createCanvas = () =>
{
    const canvas = Object.create(RoomSpriteCanvas.prototype) as RoomSpriteCanvas & Record<string, unknown>;

    Object.assign(canvas, {
        _master: {},
        _display: { scale: { x: 1, y: 1, set(x: number, y: number = x) { this.x = x; this.y = y; } }, x: 0, y: 0 },
        _width: 800,
        _height: 600,
        _screenOffsetX: 0,
        _screenOffsetY: 0,
        _scale: 1,
        _isFlipped: false,
        _mouseLocation: { x: 0, y: 0 },
        _mouseCheckCount: 0,
        _mouseSpriteWasHit: false,
        _noSpriteVisibilityChecking: false,
        _usesExclusionRectangles: false
    });

    return canvas;
};

describe('RoomSpriteCanvas flip', () =>
{
    it('starts unflipped and reports the flip state through the getter', () =>
    {
        const canvas = createCanvas();

        expect(canvas.isFlipped).toBe(false);

        canvas.setFlip(true);

        expect(canvas.isFlipped).toBe(true);
        expect(canvas.scale).toBe(1);
    });

    it('turns the room 180 degrees around the canvas centre and toggling back restores the offset', () =>
    {
        const canvas = createCanvas();

        canvas.setFlip(true);

        // The centre pixel stays put: the display origin moves to the far corner.
        expect(canvas.screenOffsetX).toBe(800);
        expect(canvas.screenOffsetY).toBe(600);

        canvas.setFlip(false);

        expect(canvas.isFlipped).toBe(false);
        expect(canvas.screenOffsetX).toBe(0);
        expect(canvas.screenOffsetY).toBe(0);
    });

    it('keeps the content under the anchor point fixed when flipping', () =>
    {
        const canvas = createCanvas();

        canvas.setFlip(true, { x: 200, y: 100 });

        // Local (200, 100) must still project to screen (200, 100) through the negative scale.
        expect((200 * -1) + canvas.screenOffsetX).toBe(200);
        expect((100 * -1) + canvas.screenOffsetY).toBe(100);
    });

    it('keeps the zoom scale positive and the flip state when zooming while flipped', () =>
    {
        const canvas = createCanvas();

        canvas.setFlip(true);
        canvas.setScale(2);

        expect(canvas.scale).toBe(2);
        expect(canvas.isFlipped).toBe(true);
        expect(canvas.width).toBe(1600);

        // A legacy negative scale request is treated as its magnitude.
        canvas.setScale(-1);

        expect(canvas.scale).toBe(1);
        expect(canvas.isFlipped).toBe(true);
    });

    it('applies the negative display scale to both axes only while flipped', () =>
    {
        const canvas = createCanvas();

        canvas.setFlip(true);

        expect((canvas as any).displayScale).toBe(-1);

        canvas.setScale(2);

        expect((canvas as any).displayScale).toBe(-2);

        canvas.setFlip(false);

        expect((canvas as any).displayScale).toBe(2);
    });

    it('maps mouse coordinates back through the flipped transform', () =>
    {
        const canvas = createCanvas();
        const seen: number[][] = [];

        Object.assign(canvas, { checkMouseHits: (x: number, y: number) => { seen.push([ x, y ]); return false; } });

        canvas.setFlip(true);
        canvas.handleMouseEvent(100, 50, 'click', false, false, false, false);

        // Screen (100, 50) sits 700 px left and 550 px above the flipped origin at (800, 600).
        expect(seen[0]).toEqual([ 700, 550 ]);
        expect((canvas as any)._mouseLocation).toEqual({ x: 700, y: 550 });
    });

    it('tests sprite visibility against the flipped screen span', () =>
    {
        const canvas = createCanvas();
        const isVisible = (x: number, y: number) => (canvas as any).isSpriteVisible(x + canvas.screenOffsetX, y + canvas.screenOffsetY, 50, 50);

        canvas.setFlip(true);

        // Local (100, 100) lands on screen at (650..700, 450..500): inside the canvas.
        expect(isVisible(100, 100)).toBe(true);

        // Local (900, 100) lands left of the screen once flipped.
        expect(isVisible(900, 100)).toBe(false);

        canvas.setFlip(false);

        expect(isVisible(100, 100)).toBe(true);
        expect(isVisible(900, 100)).toBe(false);
    });
});
