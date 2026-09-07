import { IMessageComposer } from '@octane/api';

export class GroupRemoveMemberComposer implements IMessageComposer<ConstructorParameters<typeof GroupRemoveMemberComposer>>
{
    private _data: ConstructorParameters<typeof GroupRemoveMemberComposer>;

    // AIR 13 KickMember: `block` true kicks and blocks the member in one message.
    constructor(groupId: number, memberId: number, block: boolean = false)
    {
        this._data = [groupId, memberId, block];
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
