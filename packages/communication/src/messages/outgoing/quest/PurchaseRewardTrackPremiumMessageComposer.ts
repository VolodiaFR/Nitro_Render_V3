import { IMessageComposer } from '@octane/api';

export class PurchaseRewardTrackPremiumMessageComposer implements IMessageComposer<ConstructorParameters<typeof PurchaseRewardTrackPremiumMessageComposer>>
{
    private _data: ConstructorParameters<typeof PurchaseRewardTrackPremiumMessageComposer>;

    constructor(trackId: string)
    {
        this._data = [trackId];
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
