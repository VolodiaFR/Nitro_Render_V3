import { IMessageEvent } from '@octane/api';
import { MessageEvent } from '@octane/events';
import { RewardTracksMessageParser } from '../../parser';

export class RewardTracksMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, RewardTracksMessageParser);
    }

    public getParser(): RewardTracksMessageParser
    {
        return this.parser as RewardTracksMessageParser;
    }
}
