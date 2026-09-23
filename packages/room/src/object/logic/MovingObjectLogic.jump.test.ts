import { IRoomObjectModel, RoomObjectVariable } from '@octane/api';
import { describe, expect, it } from 'vitest';
import { MovingObjectLogic } from './MovingObjectLogic';

const model = (style: number, intensity: number) => ({
    getValue: (key: string) => (key === RoomObjectVariable.FURNITURE_MOVE_STYLE ? style : (key === RoomObjectVariable.FURNITURE_MOVE_STYLE_INTENSITY ? intensity : undefined))
}) as unknown as IRoomObjectModel;

describe('MovingObjectLogic jump arc', () =>
{
    it('lifts a jumping furni in a parabola that peaks halfway at strength / 100 tiles', () =>
    {
        const jump = model(MovingObjectLogic.STYLE_JUMP, 80);

        expect(MovingObjectLogic.jumpLift(0, jump)).toBe(0);
        expect(MovingObjectLogic.jumpLift(0.5, jump)).toBeCloseTo(0.8);
        expect(MovingObjectLogic.jumpLift(1, jump)).toBe(0);
        expect(MovingObjectLogic.jumpLift(0.25, jump)).toBeCloseTo(0.6);
    });

    it('dips for a negative strength and leaves every other style flat', () =>
    {
        expect(MovingObjectLogic.jumpLift(0.5, model(MovingObjectLogic.STYLE_JUMP, -100))).toBeCloseTo(-1);
        expect(MovingObjectLogic.jumpLift(0.5, model(4, 100))).toBe(0);
        expect(MovingObjectLogic.jumpLift(0.5, null)).toBe(0);
    });
});
