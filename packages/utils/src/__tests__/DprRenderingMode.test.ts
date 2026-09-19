import { afterEach, describe, expect, it, vi } from 'vitest';
import { GetDesiredResolution, GetDesiredScaleMode } from '../DprRenderingMode';

const withDpr = (dpr: number): void =>
{
    vi.stubGlobal('window', { devicePixelRatio: dpr, matchMedia: undefined });
};

describe('DprRenderingMode', () =>
{
    afterEach(() => vi.unstubAllGlobals());

    it('renders 1:1 on whole-number device pixel ratios', () =>
    {
        withDpr(1);
        expect(GetDesiredResolution()).toBe(1);
        withDpr(2);
        expect(GetDesiredResolution()).toBe(2);
        withDpr(3);
        expect(GetDesiredResolution()).toBe(3);
    });

    it('renders at the whole number below a fractional ratio so the browser scales up smoothly', () =>
    {
        withDpr(1.25);
        expect(GetDesiredResolution()).toBe(1);
        withDpr(1.5);
        expect(GetDesiredResolution()).toBe(1);
        withDpr(1.75);
        expect(GetDesiredResolution()).toBe(1);
        withDpr(2.625);
        expect(GetDesiredResolution()).toBe(2);
    });

    it('treats floating point noise around a whole number as that whole number', () =>
    {
        withDpr(1.9999999);
        expect(GetDesiredResolution()).toBe(2);
    });

    it('never drops below 1 and tolerates a missing ratio', () =>
    {
        withDpr(0.5);
        expect(GetDesiredResolution()).toBe(1);
        vi.stubGlobal('window', { devicePixelRatio: undefined });
        expect(GetDesiredResolution()).toBe(1);
    });

    it('keeps nearest-neighbour texture sampling', () =>
    {
        withDpr(1.25);
        expect(GetDesiredScaleMode()).toBe('nearest');
    });
});
