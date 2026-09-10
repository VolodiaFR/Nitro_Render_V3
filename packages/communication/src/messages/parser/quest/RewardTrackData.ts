import { IMessageDataWrapper } from '@octane/api';

/** One level of a reward-track task (AIR 13 class_4130). */
export class RewardTrackTaskLevelData
{
    private _requiredCount: number;
    private _pointsReward: number;
    private _premium: boolean;

    constructor(wrapper: IMessageDataWrapper)
    {
        this._requiredCount = wrapper.readInt();
        this._pointsReward = wrapper.readInt();
        this._premium = wrapper.readBoolean();
    }

    public get requiredCount(): number
    {
        return this._requiredCount;
    }

    public get pointsReward(): number
    {
        return this._pointsReward;
    }

    public get premium(): boolean
    {
        return this._premium;
    }
}

/** A reward-track task (AIR 13 class_4037). */
export class RewardTrackTaskData
{
    private _id: string;
    private _actionType: string;
    private _parameter: string;
    private _progressCount: number;
    private _premium: boolean;
    private _levels: RewardTrackTaskLevelData[];

    constructor(wrapper: IMessageDataWrapper)
    {
        this._id = wrapper.readString();
        this._actionType = wrapper.readString();
        this._parameter = wrapper.readString();
        this._progressCount = wrapper.readInt();
        this._premium = wrapper.readBoolean();
        this._levels = [];

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++) this._levels.push(new RewardTrackTaskLevelData(wrapper));
    }

    public get id(): string
    {
        return this._id;
    }

    public get actionType(): string
    {
        return this._actionType;
    }

    public get parameter(): string
    {
        return this._parameter;
    }

    public get progressCount(): number
    {
        return this._progressCount;
    }

    public set progressCount(value: number)
    {
        this._progressCount = value;
    }

    public get premium(): boolean
    {
        return this._premium;
    }

    public get levels(): RewardTrackTaskLevelData[]
    {
        return this._levels;
    }

    public get isComplete(): boolean
    {
        return this._levels.every(level => this._progressCount >= level.requiredCount);
    }

    public get hasProgress(): boolean
    {
        return this._progressCount > 0;
    }

    /** The first level not reached yet, or the last one when the task is complete. */
    public get activeLevelIndex(): number
    {
        const index = this._levels.findIndex(level => this._progressCount < level.requiredCount);

        return (index === -1) ? Math.max(0, this._levels.length - 1) : index;
    }

    public get activeLevel(): RewardTrackTaskLevelData
    {
        return this._levels[this.activeLevelIndex] ?? null;
    }

    public progressRatioFor(level: RewardTrackTaskLevelData): number
    {
        if(!level || (level.requiredCount <= 0)) return 1;

        return Math.min(1, Math.max(0, this._progressCount / level.requiredCount));
    }
}

/** A prize on the track (AIR 13 class_3945). */
export class RewardTrackPrizeData
{
    private _id: string;
    private _requiredPoints: number;
    private _productItemTypeId: number;
    private _rewardTypeId: string;
    private _extraParams: string;
    private _rewardAmount: number;
    private _premium: boolean;
    private _available: boolean;
    private _claimed: boolean;

    constructor(wrapper: IMessageDataWrapper)
    {
        this._id = wrapper.readString();
        this._requiredPoints = wrapper.readInt();
        this._productItemTypeId = wrapper.readShort();
        this._rewardTypeId = wrapper.readString();
        this._extraParams = wrapper.readString();
        this._rewardAmount = wrapper.readInt();
        this._premium = wrapper.readBoolean();
        this._available = wrapper.readBoolean();
        this._claimed = wrapper.readBoolean();
    }

    public get id(): string
    {
        return this._id;
    }

    public get requiredPoints(): number
    {
        return this._requiredPoints;
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

    public get rewardAmount(): number
    {
        return this._rewardAmount;
    }

    public get premium(): boolean
    {
        return this._premium;
    }

    public get available(): boolean
    {
        return this._available;
    }

    public set available(value: boolean)
    {
        this._available = value;
    }

    public get claimed(): boolean
    {
        return this._claimed;
    }

    public set claimed(value: boolean)
    {
        this._claimed = value;
    }

    public isPremiumLocked(track: RewardTrackData): boolean
    {
        return this._premium && !track.premium;
    }

    public hasEnoughPoints(track: RewardTrackData): boolean
    {
        return track.points >= this._requiredPoints;
    }

    public isAvailable(track: RewardTrackData): boolean
    {
        return !this.isPremiumLocked(track) && this.hasEnoughPoints(track);
    }

    public isClaimable(track: RewardTrackData): boolean
    {
        return this.isAvailable(track) && !this._claimed;
    }
}

/** A reward track (AIR 13 class_2464). */
export class RewardTrackData
{
    private _id: string;
    private _theme: string;
    private _points: number;
    private _hasPremiumConfig: boolean;
    private _taskPointsBoost: number;
    private _instantPoints: number;
    private _costDiamonds: number;
    private _costCredits: number;
    private _premium: boolean;
    private _complete: boolean;
    private _premiumComplete: boolean;
    private _tasks: RewardTrackTaskData[];
    private _prizes: RewardTrackPrizeData[];

    constructor(wrapper: IMessageDataWrapper)
    {
        this._id = wrapper.readString();
        this._theme = wrapper.readString();
        this._points = wrapper.readInt();
        this._hasPremiumConfig = wrapper.readBoolean();
        this._taskPointsBoost = 0;
        this._instantPoints = 0;
        this._costDiamonds = 0;
        this._costCredits = 0;

        if(this._hasPremiumConfig)
        {
            this._taskPointsBoost = wrapper.readDouble();
            this._instantPoints = wrapper.readInt();
            this._costDiamonds = wrapper.readInt();
            this._costCredits = wrapper.readInt();
        }

        this._premium = wrapper.readBoolean();
        this._complete = wrapper.readBoolean();
        this._premiumComplete = wrapper.readBoolean();
        this._tasks = [];
        this._prizes = [];

        const taskCount = wrapper.readInt();

        for(let i = 0; i < taskCount; i++) this._tasks.push(new RewardTrackTaskData(wrapper));

        const prizeCount = wrapper.readInt();

        for(let i = 0; i < prizeCount; i++) this._prizes.push(new RewardTrackPrizeData(wrapper));
    }

    public get id(): string
    {
        return this._id;
    }

    public get theme(): string
    {
        return this._theme;
    }

    public get points(): number
    {
        return this._points;
    }

    public set points(value: number)
    {
        this._points = value;
        this.refreshDerivedState();
    }

    public get hasPremiumConfig(): boolean
    {
        return this._hasPremiumConfig;
    }

    public get taskPointsBoost(): number
    {
        return this._taskPointsBoost;
    }

    public get instantPoints(): number
    {
        return this._instantPoints;
    }

    public get costDiamonds(): number
    {
        return this._costDiamonds;
    }

    public get costCredits(): number
    {
        return this._costCredits;
    }

    public get premium(): boolean
    {
        return this._premium;
    }

    public get complete(): boolean
    {
        return this._complete;
    }

    public get premiumComplete(): boolean
    {
        return this._premiumComplete;
    }

    public get tasks(): RewardTrackTaskData[]
    {
        return this._tasks;
    }

    public get prizes(): RewardTrackPrizeData[]
    {
        return this._prizes;
    }

    public getTask(taskId: string): RewardTrackTaskData
    {
        return this._tasks.find(task => task.id === taskId) ?? null;
    }

    public getPrize(prizeId: string): RewardTrackPrizeData
    {
        return this._prizes.find(prize => prize.id === prizeId) ?? null;
    }

    public get completedTaskCount(): number
    {
        return this._tasks.filter(task => task.isComplete).length;
    }

    public get totalTaskCount(): number
    {
        return this._tasks.length;
    }

    public get claimedPrizeCount(): number
    {
        return this._prizes.filter(prize => prize.claimed).length;
    }

    public get totalPrizeCount(): number
    {
        return this._prizes.length;
    }

    public get claimablePrizeCount(): number
    {
        return this._prizes.filter(prize => prize.isClaimable(this)).length;
    }

    public get hasPremiumPrizes(): boolean
    {
        return this._prizes.some(prize => prize.premium);
    }

    public get hasPremiumTasks(): boolean
    {
        return this._tasks.some(task => task.premium);
    }

    public get hasPremiumLevels(): boolean
    {
        return this._tasks.some(task => task.levels.some(level => level.premium));
    }

    public markPrizeClaimed(prizeId: string): void
    {
        const prize = this.getPrize(prizeId);

        if(prize) prize.claimed = true;

        this.refreshDerivedState();
    }

    public markPremiumPurchased(points: number): void
    {
        this._premium = true;
        this._points = points;
        this.refreshDerivedState();
    }

    /** The official rule: complete = every free prize claimed; premiumComplete adds the premium ones. */
    public refreshDerivedState(): void
    {
        for(const prize of this._prizes) prize.available = prize.isAvailable(this);

        this._complete = this._prizes.filter(prize => !prize.premium).every(prize => prize.claimed);
        this._premiumComplete = !this._hasPremiumConfig || (this._complete && this._prizes.filter(prize => prize.premium).every(prize => prize.claimed));
    }
}
