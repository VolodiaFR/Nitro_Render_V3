import { IMessageComposer } from '@octane/api';

/** GetCustomFilter (145): asks for the personal word filter list. */
export class GetCustomFilterMessageComposer implements IMessageComposer<ConstructorParameters<typeof GetCustomFilterMessageComposer>>
{
    private _data: ConstructorParameters<typeof GetCustomFilterMessageComposer>;

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
