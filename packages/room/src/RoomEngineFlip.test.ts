import { describe, expect, it, vi } from 'vitest';
import { Rectangle } from 'pixi.js';
import { RoomEngine } from './RoomEngine';
import { RoomInstanceData } from './utils';

vi.mock('./GetRoomMessageHandler', () => ({
    GetRoomMessageHandler: () => ({})
}));

vi.mock('./GetRoomEngine', () => ({
    GetRoomEngine: () => null
}));

const createFakeCanvas = () =>
{
    const canvas = {
        width: 800,
        height: 600,
        scale: 1,
        isFlipped: false,
        screenOffsetX: 0,
        screenOffsetY: 0,
        setScale: vi.fn((scale: number) =>
        {
            canvas.scale = scale;
        }),
        setFlip: vi.fn((flag: boolean) =>
        {
            canvas.isFlipped = flag;
        })
    };

    return canvas;
};

const createEngine = (roomId: number, canvas: ReturnType<typeof createFakeCanvas>) =>
{
    const instanceData = new RoomInstanceData(roomId);
    const engine = Object.create(RoomEngine.prototype) as RoomEngine;

    Object.assign(engine, {
        _activeRoomId: roomId,
        _activeRoomActiveCanvas: 1,
        _roomInstanceDatas: new Map([[ roomId, instanceData ]]),
        getRoomInstanceRenderingCanvas: () => canvas
    });

    return { engine, instanceData };
};

// A room object standing at room-space screen point (100, 40) whose sprite
// bounding box spans (-20, -60) to (30, 0) around that point.
const stubRoomObject = (engine: RoomEngine) =>
{
    Object.assign(engine, {
        getRoomInstanceGeometry: () => ({ getScreenPoint: () => ({ x: 100, y: 40 }) }),
        getRoomObject: () => ({
            getLocation: () => ({ x: 0, y: 0, z: 0 }),
            visualization: { getBoundingRectangle: () => new Rectangle(-20, -60, 50, 60) }
        })
    });
};

describe('RoomEngine room flip', () =>
{
    it('toggles the canvas flip on every forced flip and exposes it through the getter', () =>
    {
        const roomId = 7;
        const canvas = createFakeCanvas();
        const { engine } = createEngine(roomId, canvas);

        expect(engine.getRoomInstanceRenderingCanvasIsFlipped(roomId, 1)).toBe(false);

        engine.setRoomInstanceRenderingCanvasScale(roomId, 1, -1, null, null, true);

        expect(canvas.setFlip).toHaveBeenLastCalledWith(true, null, null);
        expect(canvas.setScale).not.toHaveBeenCalled();
        expect(engine.getRoomInstanceRenderingCanvasIsFlipped(roomId, 1)).toBe(true);
        expect(engine.getRoomInstanceRenderingCanvasIsFlipped()).toBe(true);

        engine.setRoomInstanceRenderingCanvasScale(roomId, 1, -1, null, null, true);

        expect(canvas.setFlip).toHaveBeenLastCalledWith(false, null, null);
        expect(engine.getRoomInstanceRenderingCanvasIsFlipped(roomId, 1)).toBe(false);
        expect(canvas.scale).toBe(1);
    });

    it('does not sync the camera to the canvas offset while flipped', () =>
    {
        const roomId = 8;
        const canvas = createFakeCanvas();
        const { engine, instanceData } = createEngine(roomId, canvas);

        canvas.isFlipped = true;
        canvas.screenOffsetX = -600;
        canvas.screenOffsetY = -300;

        engine.setRoomInstanceRenderingCanvasScale(roomId, 1, 2);

        expect(canvas.scale).toBe(2);
        expect(instanceData.roomCamera.location).toBeNull();
    });

    it('snaps discrete levels but passes animated scales through untouched', () =>
    {
        const roomId = 9;
        const canvas = createFakeCanvas();
        const { engine } = createEngine(roomId, canvas);

        engine.setRoomInstanceRenderingCanvasScale(roomId, 1, 2.7);

        expect(canvas.scale).toBe(2);

        engine.setRoomInstanceRenderingCanvasScale(roomId, 1, 2.7, null, null, false, true);

        expect(canvas.scale).toBe(2.7);
    });

    it('reports an unflipped canvas when there is no room', () =>
    {
        const engine = Object.create(RoomEngine.prototype) as RoomEngine;

        Object.assign(engine, { _activeRoomId: 1, _activeRoomActiveCanvas: 1, getRoomInstanceRenderingCanvas: () => null });

        expect(engine.getRoomInstanceRenderingCanvasIsFlipped(1, 1)).toBe(false);
    });

    it('projects object screen locations through the flipped transform', () =>
    {
        const roomId = 10;
        const canvas = createFakeCanvas();
        const { engine } = createEngine(roomId, canvas);

        stubRoomObject(engine);

        expect(engine.getRoomObjectScreenLocation(roomId, 1, 10, 1)).toMatchObject({ x: 500, y: 340 });

        // Flipping mirrors the point through the canvas centre on both axes.
        canvas.isFlipped = true;

        expect(engine.getRoomObjectScreenLocation(roomId, 1, 10, 1)).toMatchObject({ x: -500, y: -340 });

        canvas.screenOffsetX = 800;
        canvas.screenOffsetY = 600;

        expect(engine.getRoomObjectScreenLocation(roomId, 1, 10, 1)).toMatchObject({ x: 300, y: 260 });
    });

    it('keeps flipped bounding rectangles positive and reflected', () =>
    {
        const roomId = 11;
        const canvas = createFakeCanvas();
        const { engine } = createEngine(roomId, canvas);

        stubRoomObject(engine);

        expect(engine.getRoomObjectBoundingRectangle(roomId, 1, 10, 1)).toMatchObject({ x: 480, y: 280, width: 50, height: 60 });

        canvas.isFlipped = true;
        canvas.screenOffsetX = 800;
        canvas.screenOffsetY = 600;

        // The far corner of the box (30, 0) becomes its near corner once flipped.
        expect(engine.getRoomObjectBoundingRectangle(roomId, 1, 10, 1)).toMatchObject({ x: 270, y: 260, width: 50, height: 60 });
    });
});
