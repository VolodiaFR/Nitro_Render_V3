import { IMessageEvent } from '@octane/api';
import { MessageEvent } from '@octane/events';
import { RewardTrackPremiumPurchaseResultMessageParser } from '../../parser';

export class RewardTrackPremiumPurchaseResultMessageEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, RewardTrackPremiumPurchaseResultMessageParser);
    }

    public getParser(): RewardTrackPremiumPurchaseResultMessageParser
    {
        return this.parser as RewardTrackPremiumPurchaseResultMessageParser;
    }
}
