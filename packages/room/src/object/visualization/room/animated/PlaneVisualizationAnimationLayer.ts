import { IAssetPlaneVisualizationAnimatedLayerItem, IGraphicAssetCollection } from '@octane/api';
import { TextureUtils } from '@octane/utils';
import { RenderTexture, Sprite, Texture } from 'pixi.js';
import { AnimationItem } from './AnimationItem';

export class PlaneVisualizationAnimationLayer
{
    private static RANDOM_SEED: number = 131071;

    private _isDisposed: boolean = false;
    private _items: AnimationItem[] = [];
    private _randomState: number;
    private _sanitizedTextures: Map<object, Texture> = new Map();
    private _ownedTextures: Set<Texture> = new Set();

    constructor(items: IAssetPlaneVisualizationAnimatedLayerItem[], assets: IGraphicAssetCollection)
    {
        this._randomState = PlaneVisualizationAnimationLayer.RANDOM_SEED;

        if(items && assets)
        {
            for(const item of items)
            {
                if(!item) continue;

                const assetName = item.assetId;

                if(assetName)
                {
                    const asset = assets.getAsset(assetName);

                    if(asset)
                    {
                        const x = this.parseCoordinate(item.x, item.randomX);
                        const y = this.parseCoordinate(item.y, item.randomY);

                        this._items.push(new AnimationItem(x, y, item.speedX || 0, item.speedY || 0, asset));
                    }
                }
            }
        }
    }

    private seededRandom(): number
    {
        this._randomState = ((this._randomState * 1103515245 + 12345) & 0x7fffffff);

        return (this._randomState % 10000) / 10000;
    }

    private parseCoordinate(value: string, randomValue: string): number
    {
        let result = 0;

        if(value)
        {
            if(value.includes('%'))
            {
                result = parseFloat(value.replace('%', '')) / 100;
            }
            else
            {
                result = parseFloat(value);
            }
        }

        if(randomValue)
        {
            const random = parseFloat(randomValue);
            if(!isNaN(random)) result += (this.seededRandom() * random);
        }

        return result;
    }

    public get disposed(): boolean
    {
        return this._isDisposed;
    }

    public get hasItems(): boolean
    {
        return this._items.length > 0;
    }

    public dispose(): void
    {
        this._isDisposed = true;

        if(this._items)
        {
            for(const item of this._items)
            {
                if(item) item.dispose();
            }

            this._items = [];
        }

        for(const texture of this._ownedTextures)
        {
            if(texture && !texture.destroyed) texture.destroy(true);
        }

        this._ownedTextures.clear();
        this._sanitizedTextures.clear();
    }

    public render(
        canvas: RenderTexture,
        offsetX: number,
        offsetY: number,
        maxX: number,
        maxY: number,
        dimensionX: number,
        dimensionY: number,
        timeSinceStartMs: number
    ): RenderTexture
    {
        if(maxX <= 0 || maxY <= 0) return canvas;

        for(const item of this._items)
        {
            if(!item || !item.bitmapData) continue;

            const point = item.getPosition(maxX, maxY, dimensionX, dimensionY, timeSinceStartMs);
            point.x = Math.trunc(point.x - offsetX);
            point.y = Math.trunc(point.y - offsetY);

            const assetWidth = item.bitmapData.width;
            const assetHeight = item.bitmapData.height;

            if(this.isVisible(point.x, point.y, assetWidth, assetHeight, canvas.width, canvas.height))
            {
                this.renderSprite(item, point.x, point.y, canvas);
            }

            if(this.isVisible(point.x - maxX, point.y, assetWidth, assetHeight, canvas.width, canvas.height))
            {
                this.renderSprite(item, point.x - maxX, point.y, canvas);
            }

            if(this.isVisible(point.x, point.y - maxY, assetWidth, assetHeight, canvas.width, canvas.height))
            {
                this.renderSprite(item, point.x, point.y - maxY, canvas);
            }

            if(this.isVisible(point.x - maxX, point.y - maxY, assetWidth, assetHeight, canvas.width, canvas.height))
            {
                this.renderSprite(item, point.x - maxX, point.y - maxY, canvas);
            }
        }

        return canvas;
    }

    private isVisible(x: number, y: number, width: number, height: number, canvasWidth: number, canvasHeight: number): boolean
    {
        return (x > -width) && (x < canvasWidth) && (y > -height) && (y < canvasHeight);
    }

    // The plane mask pipeline keys PURE BLACK as "cut this pixel out"
    // (PlaneMaskFilter turns rgb(0,0,0) transparent), so any pure-black
    // content — the clouds' 1px outlines — gets erased on planes that carry
    // window masks. Shift pure black to rgb(1,1,1) once per asset: visually
    // identical, but no longer matches the mask key.
    private getRenderTexture(item: AnimationItem): Texture
    {
        let texture = this._sanitizedTextures.get(item.bitmapData);

        if(texture) return texture;

        texture = item.bitmapData.texture;

        try
        {
            const source = TextureUtils.generateCanvas(item.bitmapData.texture) as HTMLCanvasElement;
            const context = source?.getContext && source.getContext('2d');

            if(context)
            {
                const imageData = context.getImageData(0, 0, source.width, source.height);
                const data = imageData.data;

                for(let i = 0; i < data.length; i += 4)
                {
                    if((data[i + 3] > 0) && !data[i] && !data[i + 1] && !data[i + 2])
                    {
                        data[i] = data[i + 1] = data[i + 2] = 1;
                    }
                }

                context.putImageData(imageData, 0, 0);

                texture = Texture.from(source);

                this._ownedTextures.add(texture);
            }
        }
        catch
        {
            // Extraction unavailable (e.g. headless tests) — draw the
            // original texture instead.
        }

        this._sanitizedTextures.set(item.bitmapData, texture);

        return texture;
    }

    private renderSprite(item: AnimationItem, x: number, y: number, canvas: RenderTexture): void
    {
        const sprite = new Sprite(this.getRenderTexture(item));
        sprite.position.set(x, y);
        TextureUtils.writeToTexture(sprite, canvas, false);
        sprite.destroy();
    }
}
