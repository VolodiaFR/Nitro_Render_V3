import { IMessageEvent } from '@octane/api';
import { MessageEvent } from '@octane/events';
import { WiredVariableFxConfigsRemovedParser } from '../../parser';

export class WiredVariableFxConfigsRemovedEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredVariableFxConfigsRemovedParser);
    }

    public getParser(): WiredVariableFxConfigsRemovedParser
    {
        return this.parser as WiredVariableFxConfigsRemovedParser;
    }
}
