import { RoomObjectCategory } from '@octane/api';
import { describe, expect, it } from 'vitest';
import { normalizeWiredClickSettings, resolveWiredClickBehaviour, tileBehind, WIRED_CLICK_FURNI_PASS_THROUGH, WIRED_CLICK_USER_PASS_THROUGH, WIRED_CLICK_USER_WALK_BEHIND } from './WiredClickSettings';

describe('WiredClickSettings', () =>
{
    it('keeps only the options the server can send', () =>
    {
        expect(normalizeWiredClickSettings(2, 1)).toEqual({ userOption: 2, furniOption: 1 });
        expect(normalizeWiredClickSettings(7, -1)).toEqual({ userOption: 0, furniOption: 0 });
    });

    it('answers per category', () =>
    {
        const passThrough = normalizeWiredClickSettings(WIRED_CLICK_USER_PASS_THROUGH, WIRED_CLICK_FURNI_PASS_THROUGH);
        const walkBehind = normalizeWiredClickSettings(WIRED_CLICK_USER_WALK_BEHIND, 0);

        expect(resolveWiredClickBehaviour(RoomObjectCategory.UNIT, passThrough)).toBe('pass-through');
        expect(resolveWiredClickBehaviour(RoomObjectCategory.FLOOR, passThrough)).toBe('pass-through');
        expect(resolveWiredClickBehaviour(RoomObjectCategory.WALL, passThrough)).toBe('default');
        expect(resolveWiredClickBehaviour(RoomObjectCategory.UNIT, walkBehind)).toBe('walk-behind');
        expect(resolveWiredClickBehaviour(RoomObjectCategory.FLOOR, walkBehind)).toBe('default');
    });

    it('finds the tile behind an avatar from its direction in degrees', () =>
    {
        expect(tileBehind(5, 5, 0)).toEqual({ x: 5, y: 6 });
        expect(tileBehind(5, 5, 90)).toEqual({ x: 4, y: 5 });
        expect(tileBehind(5, 5, 180)).toEqual({ x: 5, y: 4 });
        expect(tileBehind(5, 5, 315)).toEqual({ x: 6, y: 6 });
        expect(tileBehind(5, 5, 360)).toEqual({ x: 5, y: 6 });
    });
});
