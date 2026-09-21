import { AlphaTolerance } from '@octane/api';
import { GetRenderer, TextureUtils } from '@octane/utils';
import { DestroyOptions, Filter, Point, Sprite, Texture, TextureSource, WebGLRenderer, WebGPURenderer } from 'pixi.js';

const BYTES_PER_PIXEL = 4;

export class ExtendedSprite extends Sprite
{
    private static SCRATCH_CANVAS: HTMLCanvasElement = null;

    private _offsetX: number = 0;
    private _offsetY: number = 0;
    private _tag: string = '';
    private _alphaTolerance: number = AlphaTolerance.MATCH_OPAQUE_PIXELS;
    private _varyingDepth: boolean = false;
    private _clickHandling: boolean = false;
    private _skipMouseHandling: boolean = false;

    private _updateId1: number = -1;
    private _updateId2: number = -1;
    private _filterSource: Filter[] = null;

    public needsUpdate(updateId1: number, updateId2: number): boolean
    {
        if((this._updateId1 === updateId1) && (this._updateId2 === updateId2)) return false;

        this._updateId1 = updateId1;
        this._updateId2 = updateId2;

        return true;
    }

    // Pixi copies and freezes every array handed to `filters`, so the reference a room
    // sprite gave us is remembered here to skip the copy when it has not changed.
    public setFilters(filters: Filter[]): void
    {
        if(filters === this._filterSource) return;

        this._filterSource = filters;
        this.filters = filters;
    }

    public setTexture(texture: Texture): void
    {
        if(!texture || texture.destroyed || !texture.source) texture = Texture.EMPTY;

        if(texture === this.texture) return;

        if(texture === Texture.EMPTY)
        {
            this._updateId1 = -1;
            this._updateId2 = -1;
        }

        this.texture = texture;
    }

    // A pooled or asset texture can be destroyed while this sprite still sits in the
    // display list (TexturePool overflow, RoomPlane / AvatarImage disposal). Pixi would
    // then batch a texture without a source, so drop it here, in the same call that
    // destroys it, and let the next render pass pick up whatever the room sprite holds.
    public override get texture(): Texture
    {
        return super.texture;
    }

    public override set texture(texture: Texture)
    {
        const previous = super.texture;

        if(previous && (previous !== texture)) previous.off('destroy', this.onTextureDestroyed, this);

        super.texture = texture;

        const current = super.texture;

        if(current && (current !== previous) && (current !== Texture.EMPTY)) current.on('destroy', this.onTextureDestroyed, this);
    }

    private onTextureDestroyed(): void
    {
        this.setTexture(null);
    }

    public override destroy(options?: DestroyOptions): void
    {
        super.texture?.off('destroy', this.onTextureDestroyed, this);

        super.destroy(options);
    }

    public containsPoint(point: Point): boolean
    {
        if(!point || (this.alphaTolerance > 255) || !this.texture || (this.texture === Texture.EMPTY)) return false;

        point = new Point((point.x * this.scale.x), (point.y * this.scale.y));

        if(!super.containsPoint(point)) return false;

        const texture = this.texture;
        const textureSource = this.texture.source;

        if((!textureSource || !textureSource.hitMap) && !ExtendedSprite.generateHitMapForTextureSource(textureSource)) return false;

        if(textureSource.hitMapDirty && ((Date.now() - (textureSource.hitMapTime ?? 0)) > 100)) ExtendedSprite.generateHitMapForTextureSource(textureSource);

        const hitMap = (textureSource.hitMap as Uint8Array);

        if(!hitMap) return false;

        let dx = (point.x + texture.frame.x);
        let dy = (point.y + texture.frame.y);

        if(this.texture.trim)
        {
            dx -= texture.trim.x;
            dy -= texture.trim.y;
        }

        dx = (Math.round(dx) * textureSource.resolution);
        dy = (Math.round(dy) * textureSource.resolution);

        const index = (dx + dy * textureSource.width) * 4;

        return (hitMap[index + 3] >= this.alphaTolerance);
    }

    private static generateHitMapForTextureSource(textureSource: TextureSource): boolean
    {
        if(!textureSource) return false;

        const width = Math.max(Math.round(textureSource.width * textureSource.resolution), 1);
        const height = Math.max(Math.round(textureSource.height * textureSource.resolution), 1);

        const pixels = (ExtendedSprite.readAlphaFromResource(textureSource, width, height) ?? ExtendedSprite.readAlphaFromGpu(textureSource, width, height));

        if(!pixels) return false;

        textureSource.hitMap = pixels;
        textureSource.hitMapDirty = false;
        textureSource.hitMapTime = Date.now();

        return true;
    }

    // Decoded assets (spritesheets, palette canvases) still hold their pixels on the CPU,
    // so their alpha can be read through a 2D canvas without stalling the GPU pipeline.
    private static readAlphaFromResource(textureSource: TextureSource, width: number, height: number): Uint8ClampedArray
    {
        const image = ExtendedSprite.getDrawableResource(textureSource);

        if(!image) return null;

        const canvas = ExtendedSprite.getScratchCanvas(width, height);
        const context = canvas?.getContext('2d', { willReadFrequently: true });

        if(!context) return null;

        context.clearRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);

        return context.getImageData(0, 0, width, height).data;
    }

    private static getDrawableResource(textureSource: TextureSource): CanvasImageSource
    {
        const resource = textureSource.resource;

        if(!resource) return null;

        if((typeof ImageBitmap !== 'undefined') && (resource instanceof ImageBitmap)) return resource;

        if((typeof HTMLCanvasElement !== 'undefined') && (resource instanceof HTMLCanvasElement)) return resource;

        if((typeof OffscreenCanvas !== 'undefined') && (resource instanceof OffscreenCanvas)) return resource;

        if((typeof HTMLImageElement !== 'undefined') && (resource instanceof HTMLImageElement)) return ((resource.complete && resource.naturalWidth) ? resource : null);

        return null;
    }

    private static getScratchCanvas(width: number, height: number): HTMLCanvasElement
    {
        if(typeof document === 'undefined') return null;

        if(!ExtendedSprite.SCRATCH_CANVAS) ExtendedSprite.SCRATCH_CANVAS = document.createElement('canvas');

        const canvas = ExtendedSprite.SCRATCH_CANVAS;

        if(canvas.width !== width) canvas.width = width;
        if(canvas.height !== height) canvas.height = height;

        return canvas;
    }

    // Render textures (avatars, room planes) only exist on the GPU, so those still need a
    // readback. The buffer is reused across regenerations of the same source.
    private static readAlphaFromGpu(textureSource: TextureSource, width: number, height: number): Uint8ClampedArray
    {
        const renderer = GetRenderer();

        if(renderer instanceof WebGPURenderer)
        {
            const texture = new Texture({ source: textureSource });

            try
            {
                return TextureUtils.getPixels(texture)?.pixels ?? null;
            }
            finally
            {
                texture.destroy(false);
            }
        }

        if(!(renderer instanceof WebGLRenderer)) return null;

        const size = (BYTES_PER_PIXEL * width * height);

        let pixels = textureSource.hitMap;

        if(!(pixels instanceof Uint8ClampedArray) || (pixels.length !== size)) pixels = new Uint8ClampedArray(size);

        const renderTarget = renderer.renderTarget.getRenderTarget(textureSource);
        const glRenderTarget = renderer.renderTarget.getGpuRenderTarget(renderTarget);

        const gl = renderer.gl;

        gl.bindFramebuffer(gl.FRAMEBUFFER, glRenderTarget.resolveTargetFramebuffer);

        gl.readPixels(
            0,
            0,
            width,
            height,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            pixels
        );

        return pixels;
    }

    public get offsetX(): number
    {
        return this._offsetX;
    }

    public set offsetX(offset: number)
    {
        this._offsetX = offset;
    }

    public get offsetY(): number
    {
        return this._offsetY;
    }

    public set offsetY(offset: number)
    {
        this._offsetY = offset;
    }

    public get tag(): string
    {
        return this._tag;
    }

    public set tag(tag: string)
    {
        this._tag = tag;
    }

    public get alphaTolerance(): number
    {
        return this._alphaTolerance;
    }

    public set alphaTolerance(tolerance: number)
    {
        this._alphaTolerance = tolerance;
    }

    public get varyingDepth(): boolean
    {
        return this._varyingDepth;
    }

    public set varyingDepth(flag: boolean)
    {
        this._varyingDepth = flag;
    }

    public get clickHandling(): boolean
    {
        return this._clickHandling;
    }

    public set clickHandling(flag: boolean)
    {
        this._clickHandling = flag;
    }

    public get skipMouseHandling(): boolean
    {
        return this._skipMouseHandling;
    }

    public set skipMouseHandling(flag: boolean)
    {
        this._skipMouseHandling = flag;
    }
}
