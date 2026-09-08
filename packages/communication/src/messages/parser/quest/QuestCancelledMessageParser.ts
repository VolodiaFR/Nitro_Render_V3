import { IMessageDataWrapper, IMessageParser } from '@octane/api';
import { QuestMessageData } from './QuestMessageData';

/** QuestCancelled (3027): the tracked quest stops; AIR 13 sends the expiry flag and the quest. */
export class QuestCancelledMessageParser implements IMessageParser
{
    private _expired: boolean;
    private _quest: QuestMessageData;

    public flush(): boolean
    {
        this._quest = null;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._expired = wrapper.readBoolean();
        this._quest = new QuestMessageData(wrapper);

        return true;
    }

    public get expired(): boolean
    {
        return this._expired;
    }

    public get quest(): QuestMessageData
    {
        return this._quest;
    }
}
