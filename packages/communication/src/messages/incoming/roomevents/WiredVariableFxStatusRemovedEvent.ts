import { IMessageEvent } from '@octane/api';
import { MessageEvent } from '@octane/events';
import { WiredVariableFxStatusRemovedParser } from '../../parser';

export class WiredVariableFxStatusRemovedEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredVariableFxStatusRemovedParser);
    }

    public getParser(): WiredVariableFxStatusRemovedParser
    {
        return this.parser as WiredVariableFxStatusRemovedParser;
    }
}
