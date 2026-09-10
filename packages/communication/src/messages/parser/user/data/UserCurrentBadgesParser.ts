import { IMessageDataWrapper, IMessageParser } from '@octane/api';

export interface IUserCurrentBadgeData
{
    slotId: number;
    badgeCode: string;
    /** Users holding the badge. */
    ownerCount: number;
    /** Official BadgeRarity tier id 0 (common) .. 6 (unique). */
    badgeRarityId: number;
}

/**
 * UserCurrentBadges (1087) in the official layout: per worn slot
 * (badgeIndex, badgeCode, ownerCount, badgeRarityId).
 */
export class UserCurrentBadgesParser implements IMessageParser
{
    private _userId: number;
    private _badges: string[];
    private _badgeDetails: IUserCurrentBadgeData[];

    public flush(): boolean
    {
        this._userId = null;
        this._badges = [];
        this._badgeDetails = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._userId = wrapper.readInt();

        let totalBadges = wrapper.readInt();

        while(totalBadges > 0)
        {
            const slotId = wrapper.readInt();
            const badgeCode = wrapper.readString();
            const ownerCount = wrapper.readInt();
            const badgeRarityId = wrapper.readInt();

            this._badges.push(badgeCode);
            this._badgeDetails.push({ slotId, badgeCode, ownerCount, badgeRarityId });

            totalBadges--;
        }

        return true;
    }

    public get userId(): number
    {
        return this._userId;
    }

    public get badges(): string[]
    {
        return this._badges;
    }

    public get badgeDetails(): IUserCurrentBadgeData[]
    {
        return this._badgeDetails;
    }
}
