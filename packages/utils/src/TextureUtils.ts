import { Container, ExtractImageOptions, ExtractOptions, ExtractSystem, GenerateTextureOptions, GetPixelsOutput, ICanvas, Matrix, RenderTexture, Renderer, Sprite, Texture } from 'pixi.js';
import { GetRenderer } from './GetRenderer';

export class TextureUtils
{
    private static _clearSprite: Sprite = null;
    private static _fillSprite: Sprite = null;
    private static _flipSprite: Sprite = null;
    private static _flipMatrix: Matrix = null;

    public static generateTexture(options: GenerateTextureOptions | Container): Texture
    {
        return this.getRenderer().textureGenerator.generateTexture(options);
    }

    public static generateTextureFromImage(image: HTMLImageElement): Texture
    {
        return Texture.from(image);
    }

    public static async generateImage(options: ExtractImageOptions | Container | Texture): Promise<HTMLImageElement>
    {
        if(!options) return null;

        if(options instanceof Texture)
        {
            if(options.destroyed || !options.source || options.source.destroyed) return null;
        }
        else if(options instanceof Container)
        {
            if(options.destroyed) return null;
        }

        try
        {
            return await this.getExtractor().image(options) as HTMLImageElement;
        }
        catch (e)
        {
            return null;
        }
    }

    public static async generateImageUrl(options: ExtractImageOptions | Container | Texture): Promise<string>
    {
        if(!options) return null;

        if(options instanceof Texture)
        {
            if(options.destroyed || !options.source || options.source.destroyed) return null;
        }
        else if(options instanceof Container)
        {
            if(options.destroyed) return null;
        }

        try
        {
            return await this.getExtractor().base64(options);
        }
        catch (e)
        {
            return null;
        }
    }

    public static generateCanvas(options: ExtractOptions | Container | Texture): ICanvas
    {
        return this.getExtractor().canvas(options);
    }

    public static clearRenderTexture(texture: Texture): Texture
    {
        if(!this._clearSprite) this._clearSprite = new Sprite(Texture.EMPTY);

        return this.writeToTexture(this._clearSprite, texture);
    }

    public static createRenderTexture(width: number, height: number): Texture
    {
        if((width < 0) || (height < 0)) return null;

        return RenderTexture.create({ width, height });
    }

    public static createAndFillRenderTexture(width: number, height: number, color: number = 16777215): Texture
    {
        if((width < 0) || (height < 0)) return null;

        return this.clearAndFillRenderTexture(this.createRenderTexture(width, height), color);
    }

    public static createAndWriteRenderTexture(width: number, height: number, container: Container, transform: Matrix = null): Texture
    {
        if((width < 0) || (height < 0)) return null;

        return this.writeToTexture(container, this.createRenderTexture(width, height), true, transform);
    }

    public static clearAndFillRenderTexture(texture: Texture, color: number = 16777215): Texture
    {
        if(!texture) return null;

        if(!this._fillSprite) this._fillSprite = new Sprite(Texture.WHITE);

        const sprite = this._fillSprite;

        sprite.tint = color;

        sprite.width = texture.width;
        sprite.height = texture.height;

        return this.writeToTexture(sprite, texture);
    }

    public static writeToTexture(container: Container, target: Texture, clear: boolean = true, transform: Matrix = null): Texture
    {
        if(!container || !target) return null;

        this.getRenderer().render({
            container,
            target,
            clear,
            transform
        });

        return target;
    }

    public static flipTextureHorizontal(texture: Texture): Texture
    {
        return this.flipTexture(texture, -1, 1);
    }

    public static flipTextureVertical(texture: Texture): Texture
    {
        return this.flipTexture(texture, 1, -1);
    }

    public static flipTextureHorizontalAndVertical(texture: Texture): Texture
    {
        return this.flipTexture(texture, -1, -1);
    }

    private static flipTexture(texture: Texture, scaleX: number, scaleY: number): Texture
    {
        if(!texture) return null;

        if(!this._flipSprite) this._flipSprite = new Sprite(Texture.EMPTY);
        if(!this._flipMatrix) this._flipMatrix = new Matrix();

        const matrix = this._flipMatrix.identity();

        matrix.scale(scaleX, scaleY);
        matrix.translate((scaleX < 0) ? texture.width : 0, (scaleY < 0) ? texture.height : 0);

        const sprite = this._flipSprite;

        sprite.texture = texture;

        const flipped = this.createAndWriteRenderTexture(texture.width, texture.height, sprite, matrix);

        sprite.texture = Texture.EMPTY;

        return flipped;
    }

    public static getPixels(options: ExtractOptions | Container | Texture): GetPixelsOutput
    {
        return this.getExtractor().pixels(options);
    }

    public static getRenderer(): Renderer
    {
        return GetRenderer();
    }

    public static getExtractor(): ExtractSystem
    {
        return this.getRenderer().extract;
    }
}
