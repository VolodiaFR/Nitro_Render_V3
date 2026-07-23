import { Texture } from 'pixi.js';
import { GetConfiguration } from '@nitrots/configuration';

type HabbiconFrame = {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
    frameCount: number;
    loop: boolean;
    frameData: { id: number, x: number, y: number, width: number, height: number }[];
    steps: { sourceFrame: number, durationMs: number }[];
};

export type HabbiconAnimationFrame = {
    texture: Texture;
    durationMs: number;
};

export type HabbiconAnimation = {
    frames: HabbiconAnimationFrame[];
    loop: boolean;
    totalDurationMs: number;
};

export class HabbiconAssetManager
{
    private static _instance: HabbiconAssetManager = null;
    private static FRAME_SIZE: number = 42;
    private static OUTLINE_SIZE: number = 2;
    private static SHADOW_PADDING: number = 5;
    private static CONTENT_INSET: number = 7;

    private _loading: Promise<void> = null;
    private _frames = new Map<number, HabbiconFrame>();
    private _textures = new Map<string, Texture>();
    private _animations = new Map<string, HabbiconAnimation>();
    private _animationLoading = new Map<string, Promise<void>>();
    private _spritesheet: HTMLImageElement = null;

    public static getInstance(): HabbiconAssetManager
    {
        if(!HabbiconAssetManager._instance) HabbiconAssetManager._instance = new HabbiconAssetManager();

        return HabbiconAssetManager._instance;
    }

    public preload(): Promise<void>
    {
        if(!this._loading) this._loading = this.load();

        return this._loading;
    }

    public getPreviewTexture(habbiconId: number, small: boolean): Texture
    {
        if(habbiconId <= 0) return null;

        void this.preload();

        const key = `${ habbiconId }:${ small ? 'small' : 'large' }`;
        const existing = this._textures.get(key);

        if(existing) return existing;

        if(!this._spritesheet || !this._spritesheet.complete) return null;

        const frame = this._frames.get(habbiconId);

        if(!frame) return null;

        const scale = small ? 0.5 : 1;
        const source = this.createFrameCanvas(this._spritesheet, frame.x, frame.y, frame.width, frame.height, scale);

        if(!source) return null;

        const texture = Texture.from(this.createBubbleCanvas(source));

        this._textures.set(key, texture);

        return texture;
    }

    public getAnimation(habbiconId: number, small: boolean): HabbiconAnimation
    {
        if(habbiconId <= 0) return null;

        void this.preload();

        const key = `${ habbiconId }:${ small ? 'small' : 'large' }`;
        const existing = this._animations.get(key);

        if(existing) return existing;

        const frame = this._frames.get(habbiconId);

        if(!frame || !frame.frameCount || !frame.steps.length) return null;

        if(!this._animationLoading.has(key)) this._animationLoading.set(key, this.loadAnimation(habbiconId, small, key, frame));

        return null;
    }

    private async load(): Promise<void>
    {
        try
        {
            const baseUrl = this.getBaseUrl();

            if(!baseUrl) return;

            const response = await fetch(`${ baseUrl }habbicons.json`);

            if(!response.ok) return;

            const data = await response.json();
            const habbicons = Array.isArray(data?.habbicons) ? data.habbicons : [];

            for(const habbicon of habbicons)
            {
                const id = Number(habbicon?.id);

                if(!id) continue;

                this._frames.set(id, {
                    id,
                    x: Number(habbicon.x) || 0,
                    y: Number(habbicon.y) || 0,
                    width: Number(habbicon.width) || HabbiconAssetManager.FRAME_SIZE,
                    height: Number(habbicon.height) || HabbiconAssetManager.FRAME_SIZE,
                    frameCount: Number(habbicon.frameCount) || 0,
                    loop: !!habbicon.loop,
                    frameData: Array.isArray(habbicon.frameData) ? habbicon.frameData.map(frame => ({
                        id: Number(frame.id) || 0,
                        x: Number(frame.x) || 0,
                        y: Number(frame.y) || 0,
                        width: Number(frame.width) || HabbiconAssetManager.FRAME_SIZE,
                        height: Number(frame.height) || HabbiconAssetManager.FRAME_SIZE
                    })) : [],
                    steps: Array.isArray(habbicon.animation?.steps) ? habbicon.animation.steps.map(step => ({
                        sourceFrame: Number(step.sourceFrame) || 0,
                        durationMs: Math.max(1, Number(step.durationMs) || 100)
                    })) : []
                });
            }

            this._spritesheet = await this.loadImage(`${ baseUrl }habbicons_spritesheet.png`);
        }
        catch
        {
            this._frames.clear();
            this._spritesheet = null;
        }
    }

    private async loadAnimation(habbiconId: number, small: boolean, key: string, frame: HabbiconFrame): Promise<void>
    {
        try
        {
            const baseUrl = this.getBaseUrl();

            if(!baseUrl) return;

            const image = await this.loadImage(`${ baseUrl }animation/${ habbiconId }.png`);

            if(!image) return;

            const scale = small ? 0.5 : 1;
            const frames: HabbiconAnimationFrame[] = [];

            for(const step of frame.steps)
            {
                const source = frame.frameData.find(frameData => frameData.id === step.sourceFrame);

                if(!source) continue;

                const canvas = this.createFrameCanvas(image, source.x, source.y, source.width, source.height, scale);

                if(!canvas) continue;

                frames.push({
                    texture: Texture.from(this.createBubbleCanvas(canvas)),
                    durationMs: step.durationMs
                });
            }

            if(!frames.length) return;

            this._animations.set(key, {
                frames,
                loop: frame.loop,
                totalDurationMs: frames.reduce((total, current) => total + current.durationMs, 0)
            });
        }
        finally
        {
            this._animationLoading.delete(key);
        }
    }

    private createFrameCanvas(image: HTMLImageElement, x: number, y: number, width: number, height: number, scale: number): HTMLCanvasElement
    {
        if(!image) return null;

        const canvas = document.createElement('canvas');

        canvas.width = Math.max(1, Math.round(width * scale));
        canvas.height = Math.max(1, Math.round(height * scale));

        const context = canvas.getContext('2d');

        if(!context) return null;

        context.imageSmoothingEnabled = false;
        context.drawImage(image, x, y, width, height, 0, 0, canvas.width, canvas.height);

        return canvas;
    }

    private createBubbleCanvas(source: HTMLCanvasElement): HTMLCanvasElement
    {
        const outline = HabbiconAssetManager.OUTLINE_SIZE;
        const padding = HabbiconAssetManager.SHADOW_PADDING;
        const inset = HabbiconAssetManager.CONTENT_INSET;
        const canvas = document.createElement('canvas');

        canvas.width = source.width + (padding * 2) + (outline * 2);
        canvas.height = source.height + (padding * 2) + (outline * 2);

        const context = canvas.getContext('2d');

        if(!context) return source;

        context.imageSmoothingEnabled = false;
        context.save();
        context.globalAlpha = 0.55;
        context.filter = 'blur(6px)';
        context.drawImage(source, inset + 2, inset + 2);
        context.restore();

        const mask = document.createElement('canvas');
        const maskContext = mask.getContext('2d');

        mask.width = source.width;
        mask.height = source.height;

        if(maskContext)
        {
            maskContext.imageSmoothingEnabled = false;
            maskContext.fillStyle = '#ffffff';
            maskContext.fillRect(0, 0, source.width, source.height);
            maskContext.globalCompositeOperation = 'destination-in';
            maskContext.drawImage(source, 0, 0);

            for(let offsetY = -outline; offsetY <= outline; offsetY++)
            {
                for(let offsetX = -outline; offsetX <= outline; offsetX++)
                {
                    if(!offsetX && !offsetY) continue;

                    context.drawImage(mask, inset + offsetX, inset + offsetY);
                }
            }
        }

        context.drawImage(source, inset, inset);

        return canvas;
    }

    private getBaseUrl(): string
    {
        const root = GetConfiguration().getValue<string>('habbicons.asset.root', '');
        const hash = GetConfiguration().getValue<string>('habbicons.asset.hash', '');

        if(!root) return '';

        const cleanRoot = root.endsWith('/') ? root : `${ root }/`;

        if(hash && hash.length) return `${ cleanRoot }${ hash }/`;

        return cleanRoot;
    }

    private loadImage(url: string): Promise<HTMLImageElement>
    {
        return new Promise(resolve =>
        {
            const image = new Image();

            image.crossOrigin = 'anonymous';
            image.onload = () => resolve(image);
            image.onerror = () => resolve(null);
            image.src = url;
        });
    }
}
