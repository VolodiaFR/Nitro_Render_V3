import { IAdvancedMap, IMessageDataWrapper, IMessageParser } from '@octane/api';
import { AdvancedMap, BinaryReader } from '@octane/utils';
import { EvaWireDataWrapper } from '../../../../codec/evawire/EvaWireDataWrapper';

/** One badge as the inventory badges packet carries it. */
export interface IBadgeDetail
{
    badgeId: number;
    badgeCode: string;
    ownerCount: number;
    badgeRarityId: number;
}

export class BadgesParser implements IMessageParser
{
    private _allBadgeCodes: string[];
    private _activeBadgeCodes: string[];
    private _badgeIds: IAdvancedMap<string, number>;
    private _badgeDetails: IBadgeDetail[];

    public flush(): boolean
    {
        this._allBadgeCodes = [];
        this._activeBadgeCodes = null;
        this._badgeIds = null;
        this._badgeDetails = [];

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._allBadgeCodes = [];
        this._activeBadgeCodes = [];
        this._badgeIds = new AdvancedMap();
        this._badgeDetails = [];

        // These are two complete wire schemas, not optional fields per badge.
        // Try modern AIR first and retry legacy Polaris only from a fresh copy.
        const length = wrapper.remainingBytes;
        let result: ReturnType<BadgesParser['readPayload']>;

        if(typeof length === 'number')
        {
            if(length < 8) return false;

            const payload = wrapper.readBytes(length).toArrayBuffer();
            const modern = new EvaWireDataWrapper(wrapper.header, new BinaryReader(payload));

            result = this.readPayload(modern, true);

            if(!result)
            {
                const legacy = new EvaWireDataWrapper(wrapper.header, new BinaryReader(payload));

                result = this.readPayload(legacy, false);
            }
        }
        else
        {
            // Transports without replayable bytes retain the modern contract.
            result = this.readPayload(wrapper, true);
        }

        if(!result) return false;

        this._badgeDetails = result.details;
        this._activeBadgeCodes = result.active;

        for(const badge of result.details)
        {
            this._badgeIds.add(badge.badgeCode, badge.badgeId);
            this._allBadgeCodes.push(badge.badgeCode);
        }

        return true;
    }

    private readPayload(wrapper: IMessageDataWrapper, hasMetadata: boolean): { details: IBadgeDetail[]; active: string[] } | null
    {
        const details: IBadgeDetail[] = [];
        const active: string[] = [];

        try
        {
            const count = wrapper.readInt();
            const minimumRecordBytes = hasMetadata ? 14 : 6;

            if(count < 0 || (typeof wrapper.remainingBytes === 'number' && count > Math.floor((wrapper.remainingBytes - 4) / minimumRecordBytes))) return null;

            for(let index = 0; index < count; index++)
            {
                const badgeId = wrapper.readInt();
                const badgeCode = this.readBadgeCode(wrapper);
                const ownerCount = hasMetadata ? wrapper.readInt() : 0;
                const badgeRarityId = hasMetadata ? wrapper.readInt() : 0;

                details.push({ badgeId, badgeCode, ownerCount, badgeRarityId });
            }

            const activeCount = wrapper.readInt();

            if(activeCount < 0 || (typeof wrapper.remainingBytes === 'number' && activeCount > Math.floor(wrapper.remainingBytes / 6))) return null;

            for(let index = 0; index < activeCount; index++)
            {
                wrapper.readInt(); // Equipped slot precedes each badge code.
                active.push(this.readBadgeCode(wrapper));
            }

            if(wrapper.bytesAvailable || (typeof wrapper.remainingBytes === 'number' && wrapper.remainingBytes !== 0)) return null;

            return { details, active };
        }
        catch
        {
            return null;
        }
    }

    private readBadgeCode(wrapper: IMessageDataWrapper): string
    {
        const length = wrapper.readShort();

        if(length < 0 || (typeof wrapper.remainingBytes === 'number' && length > wrapper.remainingBytes)) throw new RangeError('Invalid badge code length');

        return wrapper.readBytes(length).toString('utf8');
    }

    public getBadgeId(code: string): number
    {
        return this._badgeIds.getValue(code);
    }
    public getAllBadgeCodes(): string[]
    {
        return this._allBadgeCodes;
    }

    /** Owner count and rarity tier per badge, as the packet sent them. */
    public getBadgeDetails(): IBadgeDetail[]
    {
        return this._badgeDetails;
    }

    public getActiveBadgeCodes(): string[]
    {
        return this._activeBadgeCodes;
    }
}
