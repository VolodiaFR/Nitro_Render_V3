import { IMessageDataWrapper, IMessageParser } from '@octane/api';
import { IWiredVariableFxStatusKey, parseWiredVariableFxStatusKey } from './WiredVariableFxData';

/** Values to stop drawing: the holder lost the variable, left, or this viewer may no longer see it. */
export class WiredVariableFxStatusRemovedParser implements IMessageParser
{
    private _keys: IWiredVariableFxStatusKey[];

    public flush(): boolean
    {
        this._keys = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._keys = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            const key = parseWiredVariableFxStatusKey(wrapper.readString());

            if(key) this._keys.push(key);
        }

        return true;
    }

    public get keys(): IWiredVariableFxStatusKey[]
    {
        return this._keys;
    }
}
