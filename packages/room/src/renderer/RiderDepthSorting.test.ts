import { IRoomObject, RoomObjectVariable } from '@octane/api';
import { Vector3d } from '@octane/utils';
import { describe, expect, it } from 'vitest';
import { SizeData } from '../object/visualization/data/SizeData';
import { RoomGeometry } from '../utils/RoomGeometry';
import { getObjectAltitudeDepth, RIDER_MOUNT_HEIGHT, RIDING_EFFECT_ID } from './ObjectAltitudeDepth';

// Horse (pet type 15) visualization data at size 64, verbatim from horse.nitro.
const HORSE_LAYERS = { 0: { tag: 'body' }, 1: { tag: 'head' }, 2: { tag: 'tail' }, 3: { tag: 'hair' }, 4: { tag: 'saddle' }, 5: {} };
const FACING_AWAY = { layers: { 0: { z: 6 }, 1: { z: 4 }, 2: { z: 35 }, 3: { z: 5 }, 4: { z: 6 } } };
const FACING_VIEWER = { layers: { 0: { z: 5 }, 1: { z: 30 }, 2: { z: 3 }, 3: { z: 35 }, 4: { z: 6 } } };
const HORSE_DIRECTIONS = {
    0: FACING_AWAY,
    1: { layers: { 0: { z: 6 }, 1: { z: 4 }, 2: { z: 35 }, 3: { z: 4 }, 4: { z: 6 } } },
    2: FACING_VIEWER,
    3: FACING_VIEWER,
    4: FACING_VIEWER,
    5: FACING_AWAY,
    6: FACING_AWAY,
    7: { layers: { 0: { z: 6 }, 1: { z: 4 }, 2: { z: 15 }, 3: { z: 5 }, 4: { z: 6 } } }
};
const BODY = 0;
const HEAD = 1;
const TAIL = 2;
const HAIR = 3;

// Mirrors of FurnitureVisualization.DEPTH_MULTIPLIER and the avatar sprite depths.
const DEPTH_MULTIPLIER = Math.sqrt(0.5);
const AVATAR_SPRITE_DEFAULT_DEPTH = -0.01;
const AVATAR_OWN_DEPTH_ADJUST = 0.001;

const createGeometry = () => new RoomGeometry(64, new Vector3d(-135, 30, 0), new Vector3d(11, 11, 5), new Vector3d(-135, 0.5, 0));

const createUnit = (location: Vector3d, effect: number = 0): IRoomObject => ({
    getLocation: () => location,
    model: { getValue: (key: string) => ((key === RoomObjectVariable.FIGURE_EFFECT) ? effect : null) }
} as unknown as IRoomObject);

// As RoomSpriteCanvas.renderObject computes it; smaller = drawn later = on top.
const sortDepth = (geometry: RoomGeometry, object: IRoomObject, relativeDepth: number) =>
    ((geometry.getScreenPosition(object.getLocation()).z - getObjectAltitudeDepth(object)) + relativeDepth);

const ridden = (direction: number, floor: number, ownUser: boolean = false) =>
{
    const geometry = createGeometry();
    const sizeData = new SizeData(6, 64);

    expect(sizeData.processLayers(HORSE_LAYERS)).toBe(true);
    expect(sizeData.processDirections(HORSE_DIRECTIONS)).toBe(true);

    const horse = createUnit(new Vector3d(6, 4, floor));
    const riderDepth = (AVATAR_SPRITE_DEFAULT_DEPTH - (ownUser ? AVATAR_OWN_DEPTH_ADJUST : 0));

    return {
        rider: sortDepth(geometry, createUnit(new Vector3d(6, 4, (floor + RIDER_MOUNT_HEIGHT)), RIDING_EFFECT_ID), riderDepth),
        layer: (layerId: number) => sortDepth(geometry, horse, ((sizeData.getLayerZOffset(direction, layerId) - (layerId * 0.001)) * DEPTH_MULTIPLIER))
    };
};

describe('ridden pet depth sorting', () =>
{
    it.each([2, 3, 4])('draws the head and mane over the rider when the horse faces the viewer (%i)', direction =>
    {
        for(const floor of [0, 2.5])
        {
            for(const ownUser of [false, true])
            {
                const { rider, layer } = ridden(direction, floor, ownUser);

                expect(layer(HEAD)).toBeLessThan(rider);
                expect(layer(HAIR)).toBeLessThan(rider);
                expect(rider).toBeLessThan(layer(BODY));
                expect(rider).toBeLessThan(layer(TAIL));
            }
        }
    });

    it.each([0, 1, 5, 6, 7])('draws the rider over the head, mane and body when the horse faces away (%i)', direction =>
    {
        for(const floor of [0, 2.5])
        {
            const { rider, layer } = ridden(direction, floor);

            expect(rider).toBeLessThan(layer(HEAD));
            expect(rider).toBeLessThan(layer(HAIR));
            expect(rider).toBeLessThan(layer(BODY));
        }
    });

    it.each([0, 1, 5, 6])('draws the tail over the rider when it is nearest the viewer (%i)', direction =>
    {
        const { rider, layer } = ridden(direction, 0);

        expect(layer(TAIL)).toBeLessThan(rider);
    });

    it('weights a rider at the pet height, and an effect 77 on the floor like any unit', () =>
    {
        expect(getObjectAltitudeDepth(createUnit(new Vector3d(1, 1, 3), RIDING_EFFECT_ID)))
            .toBeCloseTo(getObjectAltitudeDepth(createUnit(new Vector3d(1, 1, 2))));
        expect(getObjectAltitudeDepth(createUnit(new Vector3d(1, 1, 0), RIDING_EFFECT_ID))).toBe(0);
    });
});
