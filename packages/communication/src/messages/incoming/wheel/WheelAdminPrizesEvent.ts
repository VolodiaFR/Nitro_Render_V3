import { IMessageEvent } from '@nitrots/api';
import { MessageEvent } from '@nitrots/events';
import { WheelAdminPrizesParser } from '../../parser';

export class WheelAdminPrizesEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, WheelAdminPrizesParser);
    }

    public getParser(): WheelAdminPrizesParser
    {
        return this.parser as WheelAdminPrizesParser;
    }
}
