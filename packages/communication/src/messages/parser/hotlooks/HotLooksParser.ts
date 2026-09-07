import { IMessageDataWrapper, IMessageParser } from '@octane/api';

/** One ready-made outfit of the avatar editor "hot looks" tab (AIR 13 HotLookInfo). */
export interface IHotLookInfo
{
    gender: string;
    figureString: string;
}

export class HotLooksParser implements IMessageParser
{
    private _hotLooks: IHotLookInfo[] = [];

    public flush(): boolean
    {
        this._hotLooks = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const gender = wrapper.readString();
            const figureString = wrapper.readString();

            this._hotLooks.push({ gender, figureString });
        }

        return true;
    }

    public get hotLooks(): IHotLookInfo[]
    {
        return this._hotLooks;
    }
}
