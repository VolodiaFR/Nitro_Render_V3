import { IMessageComposer } from '@octane/api';

export class TriggerHabbiconComposer implements IMessageComposer<ConstructorParameters<typeof TriggerHabbiconComposer>>
{
    private _data: ConstructorParameters<typeof TriggerHabbiconComposer>;

    constructor(habbiconId: number)
    {
        this._data = [habbiconId];
    }

    public getMessageArray()
    {
        return this._data;
    }

    public dispose(): void
    {
        this._data = null;
    }
}
