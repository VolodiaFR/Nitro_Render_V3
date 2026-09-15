import { IMessageEvent } from '@octane/api';
import { MessageEvent } from '@octane/events';
import { GroupMembersRefreshParser } from '../../parser';

export class GroupMembersRefreshEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, GroupMembersRefreshParser);
    }

    public getParser(): GroupMembersRefreshParser
    {
        return this.parser as GroupMembersRefreshParser;
    }
}
