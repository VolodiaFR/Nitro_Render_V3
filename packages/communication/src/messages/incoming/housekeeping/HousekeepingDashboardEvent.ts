import { IMessageEvent } from '@nitrots/api';
import { MessageEvent } from '@nitrots/events';
import { HousekeepingDashboardParser } from '../../parser';

export class HousekeepingDashboardEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, HousekeepingDashboardParser);
    }

    public getParser(): HousekeepingDashboardParser
    {
        return this.parser as HousekeepingDashboardParser;
    }
}
