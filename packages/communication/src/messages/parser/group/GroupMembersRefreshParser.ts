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

        this.groupId = wrapper.readInt();
        this.userId = wrapper.readInt();

        return true;
    }
}
