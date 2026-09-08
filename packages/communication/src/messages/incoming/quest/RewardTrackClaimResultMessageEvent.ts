import { IMessageEvent } from '@octane/api';
import { MessageEvent } from '@octane/events';
import { RewardTrackClaimResultMessageParser } from '../../parser';

export class RewardTrackClaimResultMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, RewardTrackClaimResultMessageParser);
    }

    public getParser(): RewardTrackClaimResultMessageParser
    {
        return this.parser as RewardTrackClaimResultMessageParser;
    }
}
