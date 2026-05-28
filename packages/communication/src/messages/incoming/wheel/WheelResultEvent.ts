import { IMessageEvent } from '@nitrots/api';
import { MessageEvent } from '@nitrots/events';
import { WheelResultParser } from '../../parser';

export class WheelResultEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WheelResultParser);
    }

    public getParser(): WheelResultParser
    {
        return this.parser as WheelResultParser;
    }
}
