import { IMessageDataWrapper, IMessageParser } from '@octane/api';
import { DailyTaskData } from './DailyTaskData';

/** DailyTaskUpdated (9450): the repeats and status of one task changed. */
export class DailyTaskUpdatedMessageParser implements IMessageParser
{
    private _taskId: number;
    private _repeats: number;
    private _status: number;
    private _secondsLeft: number;

    public flush(): boolean
    {
        this._taskId = 0;
        this._repeats = 0;
        this._status = 0;
        this._secondsLeft = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._taskId = DailyTaskData.readLong(wrapper);
        this._repeats = wrapper.readInt();
        this._status = wrapper.readByte();
        this._secondsLeft = wrapper.readInt();

        return true;
    }

    public get taskId(): number
    {
        return this._taskId;
    }

    public get repeats(): number
    {
        return this._repeats;
    }

    public get status(): number
    {
        return this._status;
    }

    public get secondsLeft(): number
    {
        return this._secondsLeft;
    }
}
