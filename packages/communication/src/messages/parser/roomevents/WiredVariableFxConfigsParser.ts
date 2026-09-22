import { IMessageDataWrapper, IMessageParser } from '@octane/api';
import { IWiredVariableFxConfig, readWiredVariableFxConfig } from './WiredVariableFxData';

/** New or changed fx configs; a first batch for a newcomer carries all of them. */
export class WiredVariableFxConfigsParser implements IMessageParser
{
    private _configs: IWiredVariableFxConfig[];

    public flush(): boolean
    {
        this._configs = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._configs = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._configs.push(readWiredVariableFxConfig(wrapper));
        }

        return true;
    }

    public get configs(): IWiredVariableFxConfig[]
    {
        return this._configs;
    }
}
