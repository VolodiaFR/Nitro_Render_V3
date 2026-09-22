import { IImageResult } from '@octane/api';
import { TextureUtils } from '@octane/utils';
import { Texture } from 'pixi.js';

export class ImageResult implements IImageResult
{
    constructor(
        public id: number = 0,
        public data: Texture = null,
        public image: HTMLImageElement = null)
    {}

    public async getImage(): Promise<HTMLImageElement>
    {
        if(this.image) return this.image;

        if(!this.data) return null;

        const texture = this.data;

        // The extract reads the texture before its first await, so once the image
        // exists the render texture has done its job and can go back to the GPU.
        this.image = await TextureUtils.generateImage(texture);

        if(this.data === texture) this.dispose();

        return this.image;
    }

    public dispose(): void
    {
        if(!this.data) return;

        if(!this.data.destroyed) this.data.destroy(true);

        this.data = null;
    }
}