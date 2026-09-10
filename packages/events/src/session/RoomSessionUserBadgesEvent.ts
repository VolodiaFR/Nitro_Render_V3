import { IRoomSession } from '@octane/api';
import { RoomSessionEvent } from './RoomSessionEvent';

/** One worn badge of UserCurrentBadges (1087) with its official rarity data. */
export interface IRoomSessionUserBadgeDetail
{
    slotId: number;
    badgeCode: string;
    ownerCount: number;
    badgeRarityId: number;
}

export class RoomSessionUserBadgesEvent extends RoomSessionEvent
{
    public static RSUBE_BADGES: string = 'RSUBE_BADGES';

    private _userId: number = 0;
    private _badges: string[];
    private _badgeDetails: IRoomSessionUserBadgeDetail[];

    constructor(session: IRoomSession, userId: number, badges: string[], badgeDetails: IRoomSessionUserBadgeDetail[] = [])
    {
        super(RoomSessionUserBadgesEvent.RSUBE_BADGES, session);

        this._badges = [];
        this._userId = userId;
        this._badges = badges;
        this._badgeDetails = badgeDetails;
    }

    public get userId(): number
    {
        return this._userId;
    }

    public get badges(): string[]
    {
        return this._badges;
    }

    public get badgeDetails(): IRoomSessionUserBadgeDetail[]
    {
        return this._badgeDetails;
    }
}
