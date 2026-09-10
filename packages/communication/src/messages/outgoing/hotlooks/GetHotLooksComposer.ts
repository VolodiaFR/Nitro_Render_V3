import { IMessageComposer } from '@octane/api';

/**
 * AIR 13 GetHotLooks: the avatar editor asks for up to `count` ready-made looks of the user's gender
 * (the official client always sends 20).
 */
export class GetHotLooksComposer implements IMessageComposer<ConstructorParameters<typeof GetHotLooksComposer>>
{
    private _data: ConstructorParameters<typeof GetHotLooksComposer>;

    constructor(count: number = 20)
    {
        this._data = [count];
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
