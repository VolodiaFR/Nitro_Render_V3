import { IMessageEvent } from '@nitrots/api';
import { MessageEvent } from '@nitrots/events';
import { UserNickIconsParser } from '../../../parser';

export class UserNickIconsEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, UserNickIconsParser);
    }

    public getParser(): UserNickIconsParser
    {
        return this.parser as UserNickIconsParser;
    }
}
