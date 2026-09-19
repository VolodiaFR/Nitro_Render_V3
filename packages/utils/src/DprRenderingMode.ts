import { TextureSource } from 'pixi.js';

export type DprScaleMode = 'nearest' | 'linear';

export const GetDesiredScaleMode = (): DprScaleMode => 'nearest';

export const GetDesiredResolution = (): number =>
{
    const dpr = window.devicePixelRatio || 1;
    const nearest = Math.round(dpr);

    if(Math.abs(dpr - nearest) < 0.001) return Math.max(1, nearest);

    return Math.max(1, Math.floor(dpr));
};

export const StartDprRenderingModeWatcher = (): void =>
{
    if(typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    TextureSource.defaultOptions.scaleMode = 'nearest';

    const watch = (): void =>
    {
        const media = window.matchMedia(`(resolution: ${ window.devicePixelRatio }dppx)`);

        const onChange = (): void =>
        {
            media.removeEventListener('change', onChange);

            window.dispatchEvent(new Event('resize'));

            watch();
        };

        media.addEventListener('change', onChange);
    };

    watch();
};
