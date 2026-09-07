import { IMessageDataWrapper } from '@octane/api';

/** One reward of a daily task (AIR 13 class_4155). */
export class DailyTaskRewardData
{
    private _productItemTypeId: number;
    private _rewardTypeId: string;
    private _extraParams: string;
    private _amount: number;

    constructor(wrapper: IMessageDataWrapper)
    {
        this._productItemTypeId = wrapper.readShort();
        this._rewardTypeId = wrapper.readString();
        this._extraParams = wrapper.readString();
        this._amount = wrapper.readInt();
    }

    public get productItemTypeId(): number
    {
        return this._productItemTypeId;
    }

    public get rewardTypeId(): string
    {
        return this._rewardTypeId;
    }

    public get extraParams(): string
    {
        return this._extraParams;
    }

    public get amount(): number
    {
        return this._amount;
    }
}

/** A daily task of the "daily reward" window (AIR 13 class_2786). */
export class DailyTaskData
{
    public static readonly STATUS_IN_PROGRESS = 0;
    public static readonly STATUS_COMPLETED = 1;
    public static readonly STATUS_CLAIMED = 2;

    private _taskId: number;
    private _taskCode: string;
    private _questTypeCode: string;
    private _isBonus: boolean;
    private _imageVersion: string;
    private _catalogName: string;
    private _requiredRepeats: number;
    private _repeats: number;
    private _status: number;
    private _secondsLeft: number;
    private _receiveTime: Date;
    private _rewards: DailyTaskRewardData[];

    constructor(wrapper: IMessageDataWrapper)
    {
        this._receiveTime = new Date();
        this._taskId = DailyTaskData.readLong(wrapper);
        this._taskCode = wrapper.readString();
        this._questTypeCode = wrapper.readString();
        this._isBonus = wrapper.readBoolean();
        this._imageVersion = wrapper.readString();
        this._catalogName = wrapper.readString();
        this._requiredRepeats = wrapper.readInt();
        this._repeats = wrapper.readInt();
        this._status = wrapper.readByte();
        this._secondsLeft = wrapper.readInt();
        this._rewards = [];

        const rewardCount = wrapper.readInt();

        for(let i = 0; i < rewardCount; i++) this._rewards.push(new DailyTaskRewardData(wrapper));
    }

    /** The official task id travels as a 64-bit integer, two big-endian ints on the wire. */
    public static readLong(wrapper: IMessageDataWrapper): number
    {
        const high = wrapper.readInt();
        const low = wrapper.readInt();

        return (high * 0x100000000) + (low >>> 0);
    }

    public get taskId(): number
    {
        return this._taskId;
    }

    public get taskCode(): string
    {
        return this._taskCode;
    }

    public get questTypeCode(): string
    {
        return this._questTypeCode;
    }

    public get isBonus(): boolean
    {
        return this._isBonus;
    }

    public get imageVersion(): string
    {
        return this._imageVersion;
    }

    public get catalogName(): string
    {
        return this._catalogName;
    }

    public get requiredRepeats(): number
    {
        return this._requiredRepeats;
    }

    public get repeats(): number
    {
        return this._repeats;
    }

    public set repeats(value: number)
    {
        this._repeats = value;
    }

    public get status(): number
    {
        return this._status;
    }

    public set status(value: number)
    {
        this._status = value;
    }

    public get rawSecondsLeft(): number
    {
        return this._secondsLeft;
    }

    public set rawSecondsLeft(value: number)
    {
        this._secondsLeft = value;
        this._receiveTime = new Date();
    }

    /** Seconds left, counted down from the moment the packet arrived; 0 once the raw value is gone. */
    public get secondsLeft(): number
    {
        if(this._secondsLeft <= 0) return 0;

        const elapsed = Math.floor((Date.now() - this._receiveTime.getTime()) / 1000);

        return Math.max(0, this._secondsLeft - elapsed);
    }

    public get isExpired(): boolean
    {
        return (this._secondsLeft < 0) && (this._status !== DailyTaskData.STATUS_IN_PROGRESS);
    }

    public get rewards(): DailyTaskRewardData[]
    {
        return this._rewards;
    }

    public get nameLocalizationKey(): string
    {
        return `dailytask.${ this._taskCode }.name`;
    }

    public get descriptionLocalizationKey(): string
    {
        return `dailytask.${ this._taskCode }.desc`;
    }

    public get hintLocalizationKey(): string
    {
        return `dailytask.${ this._taskCode }.hint`;
    }
}
