import { IGraphicAsset } from '@nitrots/api';
import { GetRenderer, TextureUtils } from '@nitrots/utils';
import { Container, Graphics, Matrix, Sprite, Texture, RenderTexture } from 'pixi.js';
import { FurnitureAnimatedVisualization } from './FurnitureAnimatedVisualization';

export class IsometricImageFurniVisualization extends FurnitureAnimatedVisualization {
    protected static THUMBNAIL: string = 'THUMBNAIL';

    private _thumbnailAssetNameNormal: string;
    private _thumbnailImageNormal: Texture;
    private _thumbnailDirection: number;
    private _thumbnailChanged: boolean;
    private _uniqueId: string;
    private _photoUrl: string;
    protected _hasOutline: boolean;

    constructor() {
        super();

        this._thumbnailAssetNameNormal = null;
        this._thumbnailImageNormal = null;
        this._thumbnailDirection = -1;
        this._thumbnailChanged = false;
        this._uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        this._photoUrl = null;
    }

    public get hasThumbnailImage(): boolean {
        return !(this._thumbnailImageNormal == null);
    }

    public setThumbnailImages(k: Texture, url?: string): void {
        this._thumbnailImageNormal = k;
        this._photoUrl = url || null;
        this._thumbnailChanged = true;
    }

    public getPhotoUrl(): string {
        return this._photoUrl;
    }

    protected updateModel(scale: number): boolean {
        const flag = super.updateModel(scale);

        if (!this._thumbnailChanged && (this._thumbnailDirection === this.direction)) {
            return flag;
        }

        this.refreshThumbnail();

        return true;
    }

    private refreshThumbnail(): void {
        if (this.asset == null) {
            return;
        }

        if (this._thumbnailImageNormal) {
            this.addThumbnailAsset(this._thumbnailImageNormal, 64);
        } else {
            this.asset.disposeAsset(`${this.getThumbnailAssetName(64)}-${this._uniqueId}`);
        }

        this._thumbnailChanged = false;
        this._thumbnailDirection = this.direction;
    }

    private addThumbnailAsset(k: Texture, scale: number): void {
        let layerId = 0;

        while (layerId < this.totalSprites) {
            const layerTag = this.getLayerTag(scale, this.direction, layerId);

            if (layerTag === IsometricImageFurniVisualization.THUMBNAIL) {
                const assetName = (this.cacheSpriteAssetName(scale, layerId, false) + this.getFrameNumber(scale, layerId));
                const asset = this.getAsset(assetName, layerId);
                const thumbnailAssetName = `${this.getThumbnailAssetName(scale)}-${this._uniqueId}`;
                const transformedTexture = this.generateTransformedThumbnail(k, asset || { width: 64, height: 64 });

                // Use the original asset's registered offsets so the thumbnail is drawn at the
                // furniture-defined sprite position. Fall back to centering when no asset exists.
                const offsetX = asset ? asset.offsetX : -Math.floor(transformedTexture.width / 2);
                const offsetY = asset ? asset.offsetY : -Math.floor(transformedTexture.height / 2);

                this.asset.addAsset(thumbnailAssetName, transformedTexture, true, offsetX, offsetY, false, false);

                const placedSprite = this.getSprite(layerId);
                if (placedSprite) {
                    placedSprite.texture = transformedTexture;
                }

                return;
            }

            layerId++;
        }
    }

    protected generateTransformedThumbnail(texture: Texture, asset: IGraphicAsset): Texture {
        const assetWidth = asset?.width || 64;
        const assetHeight = asset?.height || 64;

        if(this._hasOutline)
        {
            const borderSize = 20;
            const bgWidth = texture.width + borderSize * 2;
            const bgHeight = texture.height + borderSize * 2;

            const container = new Container();
            const background = new Sprite(Texture.WHITE);
            background.tint = 0x000000;
            background.width = bgWidth;
            background.height = bgHeight;

            const imageSprite = new Sprite(texture);
            imageSprite.position.set(borderSize, borderSize);

            container.addChild(background, imageSprite);

            const flatRenderTexture = RenderTexture.create({ width: bgWidth, height: bgHeight, resolution: 1 });
            GetRenderer().render({ container, target: flatRenderTexture, clear: true });

            texture = flatRenderTexture;
        }

        texture.source.scaleMode = 'linear';

        const scaleX = assetWidth / texture.width;
        const scaleY = assetHeight / texture.height;

        const matrix = new Matrix();

        switch(this.direction)
        {
            case 2:
                matrix.a = scaleX;
                matrix.b = -(0.5 * scaleX);
                matrix.c = 0;
                matrix.d = (scaleY / 1.6);
                matrix.tx = 0;
                matrix.ty = (0.5 * scaleX * texture.width);
                break;
            case 0:
            case 4:
                matrix.a = scaleX;
                matrix.b = (0.5 * scaleX);
                matrix.c = 0;
                matrix.d = (scaleY / 1.6);
                matrix.tx = 0;
                matrix.ty = 0;
                break;
            default:
                matrix.a = scaleX;
                matrix.b = 0;
                matrix.c = 0;
                matrix.d = scaleY;
                matrix.tx = 0;
                matrix.ty = 0;
        }

        const transformedSprite = new Sprite(texture);
        transformedSprite.setFromMatrix(matrix);

        const bounds = transformedSprite.getBounds();
        const renderWidth = Math.ceil(bounds.width);
        const renderHeight = Math.ceil(bounds.height);

        transformedSprite.position.set(-bounds.x, -bounds.y);

        const renderTexture = RenderTexture.create({ width: renderWidth, height: renderHeight, resolution: 1 });
        GetRenderer().render({ container: transformedSprite, target: renderTexture, clear: true });

        return renderTexture;
    }

    protected getSpriteAssetName(scale: number, layerId: number): string {
        if (this._thumbnailImageNormal && (this.getLayerTag(scale, this.direction, layerId) === IsometricImageFurniVisualization.THUMBNAIL)) {
            return `${this.getThumbnailAssetName(scale)}-${this._uniqueId}`;
        }

        return super.getSpriteAssetName(scale, layerId);
    }

    protected getThumbnailAssetName(scale: number): string {
        return this.cacheSpriteAssetName(scale, 2, false) + this.getFrameNumber(scale, 2);
    }

    protected getFullThumbnailAssetName(k: number, _arg_2: number): string {
        return [this._type, k, 'thumb', _arg_2].join('_');
    }
}