import { IMessageDataWrapper, IMessageParser } from '@octane/api';

/** RewardTrackProgress (9452): a task moved and the track points it yielded. */
export class RewardTrackProgressMessageParser implements IMessageParser
{
    private _trackId: string;
    private _taskId: string;
    private _progressCount: number;
    private _points: number;

    public flush(): boolean
    {
        this._trackId = '';
        this._taskId = '';
        this._progressCount = 0;
        this._points = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._trackId = wrapper.readString();
        this._taskId = wrapper.readString();
        this._progressCount = wrapper.readInt();
        this._points = wrapper.readInt();

        return true;
    }

    public get trackId(): string
    {
        return this._trackId;
    }

    public get taskId(): string
    {
        return this._taskId;
    }

    public get progressCount(): number
    {
        return this._progressCount;
    }

    public get points(): number
    {
        return this._points;
    }
}
