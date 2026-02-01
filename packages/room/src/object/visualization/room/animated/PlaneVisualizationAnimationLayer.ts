import { IAssetPlaneVisualizationAnimatedLayerItem, IGraphicAssetCollection } from '@nitrots/api';
import { TextureUtils } from '@nitrots/utils';
import { RenderTexture, Sprite } from 'pixi.js';
import { AnimationItem } from './AnimationItem';

export class PlaneVisualizationAnimationLayer
{
    private _isDisposed: boolean = false;
    private _items: AnimationItem[] = [];

    constructor(items: IAssetPlaneVisualizationAnimatedLayerItem[], assets: IGraphicAssetCollection)
    {
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
            if(!isNaN(random)) result += (Math.random() * random);
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

            // Render at primary position
            if(this.isVisible(point.x, point.y, assetWidth, assetHeight, canvas.width, canvas.height))
            {
                this.renderSprite(item, point.x, point.y, canvas);
            }

            // Wrap horizontally (left side)
            if(this.isVisible(point.x - maxX, point.y, assetWidth, assetHeight, canvas.width, canvas.height))
            {
                this.renderSprite(item, point.x - maxX, point.y, canvas);
            }

            // Wrap vertically (top side)
            if(this.isVisible(point.x, point.y - maxY, assetWidth, assetHeight, canvas.width, canvas.height))
            {
                this.renderSprite(item, point.x, point.y - maxY, canvas);
            }

            // Wrap both (top-left corner)
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

    private renderSprite(item: AnimationItem, x: number, y: number, canvas: RenderTexture): void
    {
        const sprite = new Sprite(item.bitmapData.texture);
        sprite.position.set(x, y);
        TextureUtils.writeToTexture(sprite, canvas, false);
    }
}
