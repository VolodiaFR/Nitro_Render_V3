import { IMessageEvent } from '@octane/api';
import { MessageEvent } from '@octane/events';
import { RewardTrackProgressMessageParser } from '../../parser';

export class RewardTrackProgressMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, RewardTrackProgressMessageParser);
    }

    public getParser(): RewardTrackProgressMessageParser
    {
        return this.parser as RewardTrackProgressMessageParser;
    }
}
