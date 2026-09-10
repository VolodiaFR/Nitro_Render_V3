import { IMessageComposer } from '@octane/api';

export class SetBuildUnderpassComposer implements IMessageComposer<ConstructorParameters<typeof SetBuildUnderpassComposer>>
{
    private _data: ConstructorParameters<typeof SetBuildUnderpassComposer>;

    constructor(enabled: boolean)
    {
        this._data = [ enabled ];
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
