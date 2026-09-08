import { IMessageEvent } from '@octane/api';
import { MessageEvent } from '@octane/events';
import { CustomFilterResultParser } from '../../../parser';

export class CustomFilterResultEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, CustomFilterResultParser);
    }

    public getParser(): CustomFilterResultParser
    {
        return this.parser as CustomFilterResultParser;
    }
}
