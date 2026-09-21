import { IMessageEvent } from '@octane/api';
import { MessageEvent } from '@octane/events';
import { WiredVariableFxStatusParser } from '../../parser';

export class WiredVariableFxStatusEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WiredVariableFxStatusParser);
    }

    public getParser(): WiredVariableFxStatusParser
    {
        return this.parser as WiredVariableFxStatusParser;
    }
}
