import { IMessageEvent } from '@octane/api';
import { MessageEvent } from '@octane/events';
import { HotLooksParser } from '../../parser';

export class HotLooksEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, HotLooksParser);
    }

    public getParser(): HotLooksParser
    {
        return this.parser as HotLooksParser;
    }
}
