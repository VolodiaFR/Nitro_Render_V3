import { IMessageDataWrapper, IMessageParser } from '@octane/api';
import { GroupMemberParser } from './utils';

export class GroupMemberUpdateParser implements IMessageParser
{
    public groupId = 0;
    public member: GroupMemberParser = null;

    public flush(): boolean
    {
        this.groupId = 0;
        this.member = null;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this.groupId = wrapper.readInt();
        this.member = new GroupMemberParser(wrapper);

        return true;
    }
}
