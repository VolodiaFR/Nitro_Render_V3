import { IMessageComposer } from '@octane/api';

export class RoomRemovePaintComposer implements IMessageComposer<ConstructorParameters<typeof RoomRemovePaintComposer>>
{
    private _data: ConstructorParameters<typeof RoomRemovePaintComposer>;

    constructor(paintType: string)
    {
        this._data = [ paintType ];
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
