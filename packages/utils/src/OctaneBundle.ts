import { inflate } from 'pako';
import { Texture } from 'pixi.js';
import { BinaryReader } from './BinaryReader';

export type OctaneBundleTextureDecoder = (bytes: ArrayBuffer, entryName: string) => Promise<Texture>;

export class OctaneBundle
{
    private static TEXT_DECODER: TextDecoder = new TextDecoder('utf-8');

    private _jsonFile: object = null;
    private _texture: Texture = null;

    public static async from(buffer: ArrayBuffer, textureDecoder: OctaneBundleTextureDecoder = decodePngTexture): Promise<OctaneBundle>
    {
        const bundle = new OctaneBundle();

        await bundle.parse(buffer, textureDecoder);

        return bundle;
    }

    public async parse(arrayBuffer: ArrayBuffer, textureDecoder: OctaneBundleTextureDecoder = decodePngTexture): Promise<void>
    {
        const binaryReader = new BinaryReader(arrayBuffer);

        let fileCount = binaryReader.readShort();

        while(fileCount > 0)
        {
            const fileNameLength = binaryReader.readShort();
            const fileName = binaryReader.readBytes(fileNameLength).toString();
            const fileLength = binaryReader.readInt();
            const buffer = binaryReader.readBytes(fileLength);
            const inflatedBuffer = inflate(buffer.toArrayBuffer());

            if(fileName.endsWith('.json'))
            {
                this._jsonFile = JSON.parse(OctaneBundle.TEXT_DECODER.decode(inflatedBuffer));
            }
            else
            {
                this._texture = await textureDecoder(exactBuffer(inflatedBuffer), fileName);
            }

            fileCount--;
        }
    }

    public get jsonFile(): object
    {
        return this._jsonFile;
    }

    public get texture(): Texture
    {
        return this._texture;
    }
}

/** The inflated bytes as their own buffer, without walking them when they already fill one. */
const exactBuffer = (bytes: Uint8Array): ArrayBuffer =>
    (bytes.byteOffset === 0) && (bytes.byteLength === bytes.buffer.byteLength)
        ? bytes.buffer as ArrayBuffer
        : bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

/**
 * The decoder used when a caller supplies none. {@link AssetManager} passes its own, which knows
 * every format a bundle may carry; this one only has to read the PNG a bundle normally holds, and
 * it does so from a blob. Turning the image into a base64 string first, as this used to, grows it
 * by a third and makes the engine parse a megabytes-long URL.
 */
const decodePngTexture: OctaneBundleTextureDecoder = async bytes =>
{
    const blob = new Blob([ bytes ], { type: 'image/png' });

    if(typeof createImageBitmap === 'function')
    {
        try
        {
            return Texture.from(await createImageBitmap(blob));
        }
        catch
        {
            // Fall through to the image element below.
        }
    }

    const objectUrl = URL.createObjectURL(blob);

    try
    {
        const image = await new Promise<HTMLImageElement>((resolve, reject) =>
        {
            const element = new Image();

            element.onload = () => resolve(element);
            element.onerror = () => reject(new Error('Could not decode the bundle image'));
            element.src = objectUrl;
        });

        return Texture.from(image);
    }
    finally
    {
        URL.revokeObjectURL(objectUrl);
    }
};
