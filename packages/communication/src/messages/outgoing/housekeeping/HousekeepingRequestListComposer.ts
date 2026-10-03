import { IMessageComposer } from '@octane/api';

/** Asks for one housekeeping list (user.chatlog, room.visits, ...) of a user or a room. */
export class HousekeepingRequestListComposer implements IMessageComposer<ConstructorParameters<typeof HousekeepingRequestListComposer>>
{
    private _data: ConstructorParameters<typeof HousekeepingRequestListComposer>;

    constructor(listKey: string, targetId: number)
    {
        this._data = [listKey, targetId];
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
