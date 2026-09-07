import { IMessageDataWrapper, IMessageParser } from '@octane/api';

/** RewardTrackPremiumPurchaseResult (2248): 0 is success, else reward_track.premium.notification.fail.N. */
export class RewardTrackPremiumPurchaseResultMessageParser implements IMessageParser
{
    private _trackId: string;
    private _resultCode: number;
    private _points: number;

    public flush(): boolean
    {
        this._trackId = '';
        this._resultCode = 0;
        this._points = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._trackId = wrapper.readString();
        this._resultCode = wrapper.readInt();
        this._points = wrapper.readInt();

        return true;
    }

    public get trackId(): string
    {
        return this._trackId;
    }

    public get resultCode(): number
    {
        return this._resultCode;
    }

    public get points(): number
    {
        return this._points;
    }
}
