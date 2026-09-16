import { IMessageEvent } from '@octane/api';
import { MessageEvent } from '@octane/events';
import { RoomUseHabbiconParser } from '../../../parser';

export class RoomUseHabbiconEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, RoomUseHabbiconParser);
    }

    public getParser(): RoomUseHabbiconParser
    {
        return this.parser as RoomUseHabbiconParser;
    }
}
