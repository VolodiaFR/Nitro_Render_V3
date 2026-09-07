import { IMessageComposer } from '@octane/api';

export class ClaimRewardTrackPrizeMessageComposer implements IMessageComposer<ConstructorParameters<typeof ClaimRewardTrackPrizeMessageComposer>>
{
    private _data: ConstructorParameters<typeof ClaimRewardTrackPrizeMessageComposer>;

    constructor(trackId: string, rewardId: string)
    {
        this._data = [trackId, rewardId];
    }

    public getMessageArray()
    {
        return this._data;
    }

    public dispose(): void
    {
        return;
    }
}
