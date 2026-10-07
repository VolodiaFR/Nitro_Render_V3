import { IMessageComposer } from '@octane/api';

/** Recolours a placed Builders Club furni: item id, colour index, scope (0 this one, 1 all like it in the room). */
export class BuildersClubRecolorFurniMessageComposer implements IMessageComposer<ConstructorParameters<typeof BuildersClubRecolorFurniMessageComposer>>
{
    private _data: ConstructorParameters<typeof BuildersClubRecolorFurniMessageComposer>;

    constructor(itemId: number, colorIndex: number, scope: number)
    {
        this._data = [itemId, colorIndex, scope];
    }

    dispose(): void
    {
        this._data = null;
    }

    public getMessageArray()
    {
        return this._data;
    }
}
