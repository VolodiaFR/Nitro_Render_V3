import { IMessageComposer } from '@octane/api';

export class GetRewardTracksMessageComposer implements IMessageComposer<ConstructorParameters<typeof GetRewardTracksMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetRewardTracksMessageComposer>;

    constructor()
    {
        this._data = [];
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
