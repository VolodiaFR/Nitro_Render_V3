import { IMessageDataWrapper, IMessageParser } from '@octane/api';

export class WiredFurniMoveStyleParser implements IMessageParser
{
    public static readonly STYLE_LINEAR = 0;
    /** Habbo's jump strength: the furni hops to its tile in an arc; the intensity is the signed strength. */
    public static readonly STYLE_JUMP = 7;
    public static readonly STYLE_MAX = 7;
    public static readonly JUMP_STRENGTH_MIN = -1000;
    public static readonly JUMP_STRENGTH_MAX = 1000;
    public static readonly MAXIMUM_ITEMS = 1000;
    /** The ids name floor furni, or room units (avatars) the server moves with a jump. */
    public static readonly KIND_FURNI = 0;
    public static readonly KIND_UNIT = 1;
    public static readonly OVERSHOOT_MIN = -64;
    public static readonly OVERSHOOT_MAX = 64;
    private static readonly HEADER_BYTES = 4;
    private static readonly ITEM_BYTES = 4;
    private static readonly TRAILER_BYTES = 8;

    private _itemIds: number[] = [];
    private _style = 0;
    private _intensity = 0;
    private _overshoot = 0;
    private _kind = WiredFurniMoveStyleParser.KIND_FURNI;

    public flush(): boolean
    {
        this._itemIds = [];
        this._style = 0;
        this._intensity = 0;
        this._overshoot = 0;
        this._kind = WiredFurniMoveStyleParser.KIND_FURNI;
        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        this.flush();
        if(!wrapper || !this.hasBytes(wrapper, WiredFurniMoveStyleParser.HEADER_BYTES)) return false;

        const count = wrapper.readInt();

        if((count < 0) || (count > WiredFurniMoveStyleParser.MAXIMUM_ITEMS)) return false;
        if(!this.hasBytes(wrapper, (count * WiredFurniMoveStyleParser.ITEM_BYTES) + WiredFurniMoveStyleParser.TRAILER_BYTES)) return false;

        const itemIds: number[] = [];

        for(let index = 0; index < count; index++)
        {
            const itemId = wrapper.readInt();

            if(itemId <= 0) return false;

            itemIds.push(itemId);
        }

        this._itemIds = itemIds;
        this._style = Math.max(WiredFurniMoveStyleParser.STYLE_LINEAR, Math.min(WiredFurniMoveStyleParser.STYLE_MAX, wrapper.readInt()));
        const intensity = wrapper.readInt();

        this._intensity = (this._style === WiredFurniMoveStyleParser.STYLE_JUMP)
            ? Math.max(WiredFurniMoveStyleParser.JUMP_STRENGTH_MIN, Math.min(WiredFurniMoveStyleParser.JUMP_STRENGTH_MAX, intensity))
            : Math.max(0, Math.min(100, intensity));

        // Trailing fields a server may leave out: tiles to fly past the target, and what the ids name.
        if(this.hasBytes(wrapper, WiredFurniMoveStyleParser.ITEM_BYTES))
        {
            this._overshoot = Math.max(WiredFurniMoveStyleParser.OVERSHOOT_MIN, Math.min(WiredFurniMoveStyleParser.OVERSHOOT_MAX, wrapper.readInt()));
        }

        if(this.hasBytes(wrapper, WiredFurniMoveStyleParser.ITEM_BYTES))
        {
            this._kind = (wrapper.readInt() === WiredFurniMoveStyleParser.KIND_UNIT) ? WiredFurniMoveStyleParser.KIND_UNIT : WiredFurniMoveStyleParser.KIND_FURNI;
        }

        return true;
    }

    private hasBytes(wrapper: IMessageDataWrapper, required: number): boolean
    {
        if(required <= 0) return true;
        if(typeof wrapper.remainingBytes === 'number') return wrapper.remainingBytes >= required;
        return wrapper.bytesAvailable;
    }

    public get overshoot(): number
    {
        return this._overshoot;
    }

    public get kind(): number
    {
        return this._kind;
    }

    public get itemIds(): readonly number[]
    {
        return this._itemIds;
    }

    public get style(): number
    {
        return this._style;
    }

    public get intensity(): number
    {
        return this._intensity;
    }
}
