import { IMessageEvent } from '@octane/api';
import { MessageEvent } from '@octane/events';
import { WiredVariableFxConfigsParser } from '../../parser';

export class WiredVariableFxConfigsEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredVariableFxConfigsParser);
    }

    public getParser(): WiredVariableFxConfigsParser
    {
        return this.parser as WiredVariableFxConfigsParser;
    }
}
