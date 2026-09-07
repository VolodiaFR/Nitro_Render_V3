import { IMessageComposer } from '@octane/api';

/** RemoveCustomFilterWord (1996). */
export class RemoveCustomFilterWordMessageComposer implements IMessageComposer<ConstructorParameters<typeof RemoveCustomFilterWordMessageComposer>>
{
    private _data: ConstructorParameters<typeof RemoveCustomFilterWordMessageComposer>;

    constructor(word: string)
    {
        this._data = [word];
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
