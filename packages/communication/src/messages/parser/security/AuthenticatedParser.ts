import { IMessageDataWrapper, IMessageParser } from '@nitrots/api';

export class AuthenticatedParser implements IMessageParser
{
    private _sessionResumed: boolean = false;
    private _roomId: number = 0;

    public flush(): boolean
    {
        this._sessionResumed = false;
        this._roomId = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._sessionResumed = wrapper.bytesAvailable ? wrapper.readBoolean() : false;
        this._roomId = wrapper.bytesAvailable ? Math.max(wrapper.readInt(), 0) : 0;

        return true;
    }

    public get sessionResumed(): boolean
    {
        return this._sessionResumed;
    }

    public get roomId(): number
    {
        return this._roomId;
    }
}
