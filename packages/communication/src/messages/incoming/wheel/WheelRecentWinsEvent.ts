import { IMessageEvent } from '@nitrots/api';
import { MessageEvent } from '@nitrots/events';
import { WheelRecentWinsParser } from '../../parser';

export class WheelRecentWinsEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WheelRecentWinsParser);
    }

    public getParser(): WheelRecentWinsParser
    {
        return this.parser as WheelRecentWinsParser;
    }
}
