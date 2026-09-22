import { IMessageDataWrapper, IMessageParser } from '@octane/api';

/** Fx configs whose box is gone; every status drawn for them goes with them. */
export class WiredVariableFxConfigsRemovedParser implements IMessageParser
{
    private _configIds: number[];

    public flush(): boolean
    {
        this._configIds = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._configIds = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._configIds.push(wrapper.readInt());
        }

        return true;
    }

    public get configIds(): number[]
    {
        return this._configIds;
    }
}
