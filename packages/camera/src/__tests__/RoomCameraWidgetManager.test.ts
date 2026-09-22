import { describe, expect, it } from 'vitest';
import type { ColorMatrix } from 'pixi.js';
import { composeCameraColorMatrices, normalizeCameraColorMatrix } from '../RoomCameraWidgetManager';

describe('normalizeCameraColorMatrix', () =>
{
    it('keeps explicit negative grayscale bias untouched', () =>
    {
        const matrix: ColorMatrix = [
            -0.5, -0.5, -0.5, 0, 1,
            -0.5, -0.5, -0.5, 0, 1,
            -0.5, -0.5, -0.5, 0, 1,
            0, 0, 0, 1, 0
        ];

        expect(normalizeCameraColorMatrix(matrix)).toEqual(matrix);
    });

    it('adds missing white bias for negative grayscale matrices', () =>
    {
        const matrix: ColorMatrix = [
            -0.5, -0.5, -0.5, 0, 0,
            -0.5, -0.5, -0.5, 0, 0,
            -0.5, -0.5, -0.5, 0, 0,
            0, 0, 0, 1, 0
        ];

        expect(normalizeCameraColorMatrix(matrix)).toEqual([
            -0.5, -0.5, -0.5, 0, 1,
            -0.5, -0.5, -0.5, 0, 1,
            -0.5, -0.5, -0.5, 0, 1,
            0, 0, 0, 1, 0
        ]);
    });

    it('normalizes legacy 255-based offsets to pixi range', () =>
    {
        const matrix: ColorMatrix = [
            1, 0, 0, 0, 255,
            0, 1, 0, 0, 128,
            0, 0, 1, 0, 64,
            0, 0, 0, 1, 255
        ];

        expect(normalizeCameraColorMatrix(matrix)).toEqual([
            1, 0, 0, 0, 1,
            0, 1, 0, 0, 128 / 255,
            0, 0, 1, 0, 64 / 255,
            0, 0, 0, 1, 1
        ]);
    });
});

describe('composeCameraColorMatrices', () =>
{
    const applyMatrix = (matrix: ColorMatrix, color: number[]): number[] =>
        [0, 1, 2, 3].map(row => matrix[(row * 5) + 4] + [0, 1, 2, 3].reduce((sum, k) => sum + (matrix[(row * 5) + k] * color[k]), 0));

    const brighten: ColorMatrix = [
        1.5, 0, 0, 0, 0.1,
        0, 1.5, 0, 0, 0.1,
        0, 0, 1.5, 0, 0.1,
        0, 0, 0, 1, 0
    ];
    const tint: ColorMatrix = [
        0.8, 0.2, 0, 0, 0,
        0, 0.6, 0.3, 0, 0.05,
        0.1, 0, 0.9, 0, -0.02,
        0, 0, 0, 0.5, 0.25
    ];

    it('applies the earlier matrix first', () =>
    {
        const color = [0.2, 0.4, 0.6, 0.8];
        const composed = composeCameraColorMatrices(tint, brighten);

        applyMatrix(composed, color).forEach((value, index) =>
            expect(value).toBeCloseTo(applyMatrix(tint, applyMatrix(brighten, color))[index], 10));
    });

    it('leaves a matrix unchanged when composed with the identity', () =>
    {
        const identity: ColorMatrix = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];

        expect(composeCameraColorMatrices(identity, tint)).toEqual(tint);
        expect(composeCameraColorMatrices(tint, identity)).toEqual(tint);
    });
});
