import { IMessageEvent } from '@nitrots/api';
import { MessageEvent } from '@nitrots/events';
import { HotelViewLandingParser } from '../../parser';

export class HotelViewLandingEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, HotelViewLandingParser);
    }

    public getParser(): HotelViewLandingParser
    {
        return this.parser as HotelViewLandingParser;
    }
}
