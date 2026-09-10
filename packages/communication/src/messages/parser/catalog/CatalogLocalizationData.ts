import { IMessageDataWrapper } from '@octane/api';
import { readBoundedCatalogCount } from './catalogPacketGuards';

export class CatalogLocalizationData
{
    // an empty string is a 2-byte length prefix
    private static readonly MIN_STRING_BYTES: number = 2;

    private _images: string[];
    private _texts: string[];

    constructor(wrapper: IMessageDataWrapper)
    {
        this._images = [];
        this._texts = [];

        const totalImages = readBoundedCatalogCount(wrapper, CatalogLocalizationData.MIN_STRING_BYTES, 'localization image');

        for(let index = 0; index < totalImages; index++)
        {
            this._images.push(wrapper.readString());
        }

        const totalTexts = readBoundedCatalogCount(wrapper, CatalogLocalizationData.MIN_STRING_BYTES, 'localization text');

        for(let index = 0; index < totalTexts; index++)
        {
            this._texts.push(wrapper.readString());
        }
    }

    public get images(): string[]
    {
        return this._images;
    }

    public get texts(): string[]
    {
        return this._texts;
    }
}
