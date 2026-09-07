import { IMessageDataWrapper, IMessageParser } from '@octane/api';

/** RewardTrackClaimResult (9451): 0 is success, any other code is localized as reward_track.claim.notification.fail.N. */
export class RewardTrackClaimResultMessageParser implements IMessageParser
{
    private _trackId: string;
    private _rewardId: string;
    private _resultCode: number;

    public flush(): boolean
    {
        this._trackId = '';
        this._rewardId = '';
        this._resultCode = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._trackId = wrapper.readString();
        this._rewardId = wrapper.readString();
        this._resultCode = wrapper.readInt();

        return true;
    }

    public get trackId(): string
    {
        return this._trackId;
    }

    public get rewardId(): string
    {
        return this._rewardId;
    }

    public get resultCode(): number
    {
        return this._resultCode;
    }
}
