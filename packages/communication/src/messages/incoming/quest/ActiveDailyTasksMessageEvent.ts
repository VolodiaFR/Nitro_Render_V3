import { IMessageEvent } from '@octane/api';
import { MessageEvent } from '@octane/events';
import { ActiveDailyTasksMessageParser } from '../../parser';

export class ActiveDailyTasksMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, ActiveDailyTasksMessageParser);
    }

    public getParser(): ActiveDailyTasksMessageParser
    {
        return this.parser as ActiveDailyTasksMessageParser;
    }
}
