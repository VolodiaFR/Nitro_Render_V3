import { IMessageEvent } from '@nitrots/api';
import { MessageEvent } from '@nitrots/events';
import { WheelDataParser } from '../../parser';

export class WheelDataEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WheelDataParser);
    }

    public getParser(): WheelDataParser
    {
        return this.parser as WheelDataParser;
    }
}
