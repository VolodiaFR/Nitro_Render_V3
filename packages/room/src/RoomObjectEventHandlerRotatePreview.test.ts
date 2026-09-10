import { RoomObjectCategory, RoomObjectOperationType } from '@octane/api';
import { describe, expect, it, vi } from 'vitest';
import { RoomObjectEventHandler } from './RoomObjectEventHandler';

vi.mock('./GetRoomEngine', () => ({
    GetRoomEngine: () => null
}));

const createHandler = (selectedData: Record<string, unknown>, options: { currentDirection?: number; nextDirection?: number; validLocation?: boolean } = {}) =>
{
    const { currentDirection = 0, nextDirection = 2, validLocation = true } = options;
    const direction = { x: currentDirection, y: 0, z: 0 };
    const roomObject = {
        getDirection: () => direction,
        getLocation: () => ({ x: 3, y: 4, z: 0 }),
        setDirection: vi.fn((vector: { x: number }) =>
        {
            direction.x = vector.x;
        })
    };
    const handler = Object.create(RoomObjectEventHandler.prototype) as RoomObjectEventHandler;
    const updateSelectedObjectData = vi.fn();

    Object.assign(handler, {
        _roomEngine: {
            getRoomObject: () => roomObject,
            getFurnitureStackingHeightMap: () => ({})
        },
        getSelectedRoomObjectData: () => selectedData,
        getValidRoomObjectDirection: () => nextDirection,
        isValidLocation: () => validLocation,
        updateSelectedObjectData
    });

    return { handler, roomObject, updateSelectedObjectData };
};

const movingFloorItem = { id: 5, category: RoomObjectCategory.FLOOR, operation: RoomObjectOperationType.OBJECT_MOVE, typeId: 9, instanceData: null, stuffData: null, state: -1, animFrame: -1, posture: null };

describe('RoomObjectEventHandler rotateActiveObjectPreview', () =>
{
    it('rotates the floor item being moved and refreshes the selection without a server round trip', () =>
    {
        const { handler, roomObject, updateSelectedObjectData } = createHandler(movingFloorItem);

        expect(handler.rotateActiveObjectPreview(1, true)).toBe(true);

        expect(roomObject.setDirection).toHaveBeenCalledWith(expect.objectContaining({ x: 2 }));
        expect(updateSelectedObjectData).toHaveBeenCalledWith(1, 5, RoomObjectCategory.FLOOR, { x: 3, y: 4, z: 0 }, expect.objectContaining({ x: 2 }), RoomObjectOperationType.OBJECT_MOVE, 9, null, null, -1, -1, null);
    });

    it('also rotates an item being placed from the inventory', () =>
    {
        const { handler } = createHandler({ ...movingFloorItem, operation: RoomObjectOperationType.OBJECT_PLACE });

        expect(handler.rotateActiveObjectPreview(1, false)).toBe(true);
    });

    it('ignores wall items and objects that are not being moved or placed', () =>
    {
        expect(createHandler({ ...movingFloorItem, category: RoomObjectCategory.WALL }).handler.rotateActiveObjectPreview(1, true)).toBe(false);
        expect(createHandler({ ...movingFloorItem, operation: RoomObjectOperationType.OBJECT_ROTATE_POSITIVE }).handler.rotateActiveObjectPreview(1, true)).toBe(false);
        expect(createHandler(null).handler.rotateActiveObjectPreview(1, true)).toBe(false);
    });

    it('leaves the preview alone when the next direction is the current one or does not fit', () =>
    {
        const same = createHandler(movingFloorItem, { currentDirection: 2, nextDirection: 2 });

        expect(same.handler.rotateActiveObjectPreview(1, true)).toBe(false);
        expect(same.roomObject.setDirection).not.toHaveBeenCalled();

        const blocked = createHandler(movingFloorItem, { validLocation: false });

        expect(blocked.handler.rotateActiveObjectPreview(1, true)).toBe(false);
        expect(blocked.roomObject.setDirection).not.toHaveBeenCalled();
    });
});
