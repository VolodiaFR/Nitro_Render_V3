import { IRoomObjectController, IRoomObjectModel, IVector3D, RoomObjectVariable } from '@octane/api';
import { Vector3d } from '@octane/utils';
import { describe, expect, it } from 'vitest';
import { ObjectMoveUpdateMessage } from '../../messages';
import { MovingObjectLogic } from './MovingObjectLogic';

const createModel = (values: Record<string, number>) =>
{
    const store = new Map<string, number>(Object.entries(values));

    return {
        store,
        getValue: (key: string) => store.get(key),
        setValue: (key: string, value: number) =>
        {
            store.set(key, value);
        }
    } as unknown as IRoomObjectModel & { store: Map<string, number> };
};

const createObject = (model: IRoomObjectModel) =>
{
    const location = new Vector3d();
    const direction = new Vector3d();

    return {
        location,
        getLocation: () => location,
        setLocation: (vector: IVector3D) =>
        {
            location.assign(vector);
        },
        getDirection: () => direction,
        setDirection: (vector: IVector3D) =>
        {
            if(vector) direction.assign(vector);
        },
        setLogic: () => null,
        model
    } as unknown as IRoomObjectController & { location: Vector3d };
};

const run = (values: Record<string, number>, from: Vector3d, to: Vector3d, duration: number, until: number) =>
{
    const model = createModel(values);
    const object = createObject(model);
    const logic = new MovingObjectLogic();
    const samples: { time: number, x: number, z: number }[] = [];

    logic.setObject(object);
    logic.update(16);
    logic.processUpdateMessage(new ObjectMoveUpdateMessage(from, to, null, true, duration));

    for(let time = 32; time <= until; time += 16)
    {
        logic.update(time);
        samples.push({ time, x: object.location.x, z: object.location.z });
    }

    return { samples, model, object };
};

describe('MovingObjectLogic projectile trajectory', () =>
{
    it('stretches a flight by the overshoot at the same speed', () =>
    {
        expect(MovingObjectLogic.overshootFactor(2, 0, 0)).toBe(1);
        expect(MovingObjectLogic.overshootFactor(2, -1, 3)).toBe(2.5);
        expect(MovingObjectLogic.overshootFactor(4, 0, -1)).toBe(0.75);
        expect(MovingObjectLogic.overshootFactor(2, 0, -5)).toBe(0);
        expect(MovingObjectLogic.overshootFactor(0, 0, 4)).toBe(1);
    });

    it('flies past the target and then lands on it', () =>
    {
        const { samples, model, object } = run(
            { [RoomObjectVariable.FURNITURE_MOVE_OVERSHOOT]: 2 },
            new Vector3d(0, 0, 0), new Vector3d(2, 0, 0), 400, 1200);

        const farthest = Math.max(...samples.map(sample => sample.x));

        expect(farthest).toBeGreaterThan(3.5);
        expect(farthest).toBeLessThanOrEqual(4);
        // Same speed: the target is crossed around 400ms, the far end around 800ms.
        expect(samples.find(sample => sample.x >= 2).time).toBeGreaterThanOrEqual(400);
        expect(samples.find(sample => sample.x >= 2).time).toBeLessThan(450);
        expect(object.location.x).toBe(2);
        expect(model.store.get(RoomObjectVariable.FURNITURE_MOVE_OVERSHOOT)).toBe(0);
    });

    it('falls short of the target, then lands on it', () =>
    {
        const { samples, object } = run(
            { [RoomObjectVariable.FURNITURE_MOVE_OVERSHOOT]: -2 },
            new Vector3d(0, 0, 0), new Vector3d(4, 0, 0), 400, 600);

        expect(samples.find(sample => sample.time === 160).x).toBeLessThanOrEqual(2);
        expect(object.location.x).toBe(4);
    });

    it('bends a flight with the curve strength and hops on the spot with nowhere to go', () =>
    {
        const curved = run(
            { [RoomObjectVariable.FURNITURE_MOVE_STYLE]: MovingObjectLogic.STYLE_JUMP, [RoomObjectVariable.FURNITURE_MOVE_STYLE_INTENSITY]: 200 },
            new Vector3d(0, 0, 1), new Vector3d(4, 0, 1), 400, 600);

        expect(Math.max(...curved.samples.map(sample => sample.z))).toBeGreaterThan(2.9);
        expect(curved.object.location.z).toBe(1);

        const hop = run(
            { [RoomObjectVariable.FURNITURE_MOVE_STYLE]: MovingObjectLogic.STYLE_JUMP, [RoomObjectVariable.FURNITURE_MOVE_STYLE_INTENSITY]: 30 },
            new Vector3d(3, 3, 0), new Vector3d(3, 3, 0), 300, 500);

        expect(Math.max(...hop.samples.map(sample => sample.z))).toBeCloseTo(0.3, 1);
        expect(hop.samples.every(sample => sample.x === 3)).toBe(true);
        expect(hop.object.location.z).toBe(0);
        expect(hop.model.store.get(RoomObjectVariable.FURNITURE_MOVE_STYLE)).toBe(0);
    });

    it('leaves a plain move untouched', () =>
    {
        const { samples, object } = run({}, new Vector3d(0, 0, 0), new Vector3d(2, 0, 0), 400, 600);

        expect(Math.max(...samples.map(sample => sample.x))).toBe(2);
        expect(object.location.x).toBe(2);
    });
});
