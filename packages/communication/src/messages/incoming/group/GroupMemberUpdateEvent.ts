import { IMessageEvent } from '@octane/api';
import { MessageEvent } from '@octane/events';
import { GroupMemberUpdateParser } from '../../parser';

export class GroupMemberUpdateEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, GroupMemberUpdateParser);
    }

    public getParser(): GroupMemberUpdateParser
    {
        return this.parser as GroupMemberUpdateParser;
    }
}
