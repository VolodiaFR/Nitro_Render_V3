import { describe, expect, it } from 'vitest';
import { settleUnitPosture } from './UnitStatusPosture';

describe('settleUnitPosture', () =>
{
    it('applies a posture the status carries', () =>
    {
        expect(settleUnitPosture(true, true, false)).toBe('apply');
        expect(settleUnitPosture(true, false, true)).toBe('apply');
    });

    it('stands a unit up when the status has no posture', () =>
    {
        expect(settleUnitPosture(false, true, false)).toBe('stand');
    });

    it('keeps a sit or lay through a sign or gesture alone', () =>
    {
        expect(settleUnitPosture(false, false, false)).toBe('keep');
    });

    it('ends a walk even when the stop status only carries a gesture', () =>
    {
        expect(settleUnitPosture(false, false, true)).toBe('stand');
    });
});
