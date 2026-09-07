import { IMessageComposer } from '@octane/api';

/** AddCustomFilterWord (68). */
export class AddCustomFilterWordMessageComposer implements IMessageComposer<ConstructorParameters<typeof AddCustomFilterWordMessageComposer>>
{
    private _data: ConstructorParameters<typeof AddCustomFilterWordMessageComposer>;

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
