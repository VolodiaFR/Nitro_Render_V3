import { IMessageDataWrapper, IMessageParser } from '@octane/api';
import { IWiredVariableFxStatus, readWiredVariableFxStatus } from './WiredVariableFxData';

/** The values to draw; `initializeAll` marks a viewer's first sync, drawn without change animations. */
export class WiredVariableFxStatusParser implements IMessageParser
{
    private _initializeAll: boolean;
    private _statuses: IWiredVariableFxStatus[];

    public flush(): boolean
    {
        this._initializeAll = false;
        this._statuses = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._initializeAll = wrapper.readBoolean();
        this._statuses = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++)
        {
            this._statuses.push(readWiredVariableFxStatus(wrapper));
        }

        return true;
    }

    public get initializeAll(): boolean
    {
        return this._initializeAll;
    }

    public get statuses(): IWiredVariableFxStatus[]
    {
        return this._statuses;
    }
}
