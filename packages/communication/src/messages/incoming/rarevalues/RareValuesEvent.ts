import { IMessageEvent } from '@nitrots/api';
import { MessageEvent } from '@nitrots/events';
import { RareValuesParser } from '../../parser';

export class RareValuesEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, RareValuesParser);
    }

    public getParser(): RareValuesParser
    {
        return this.parser as RareValuesParser;
    }
}
