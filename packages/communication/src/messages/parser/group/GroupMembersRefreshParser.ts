import { IMessageDataWrapper, IMessageParser } from '@octane/api';

export class GroupMembersRefreshParser implements IMessageParser
{
    public groupId = 0;
    public userId = 0;

    public flush(): boolean
    {
        this.groupId = 0;
        this.userId = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        // Two fixed ints. BinaryReader has no bounds check, so a short frame has to be
        // rejected here rather than thrown out of readInt.
        if((typeof wrapper.remainingBytes === 'number') && (wrapper.remainingBytes < 8)) return false;

        this.groupId = wrapper.readInt();
        this.userId = wrapper.readInt();

        return true;
    }
}
