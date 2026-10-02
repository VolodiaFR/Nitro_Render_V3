import { IRoomSession } from '@octane/api';
import { RoomSessionEvent } from './RoomSessionEvent';

export class RoomSessionChatEvent extends RoomSessionEvent
{
    public static CHAT_EVENT: string = 'RSCE_CHAT_EVENT';
    public static FLOOD_EVENT: string = 'RSCE_FLOOD_EVENT';

    public static CHAT_TYPE_SPEAK: number = 0;
    public static CHAT_TYPE_WHISPER: number = 1;
    public static CHAT_TYPE_SHOUT: number = 2;
    public static CHAT_TYPE_RESPECT: number = 3;
    public static CHAT_TYPE_PETRESPECT: number = 4;
    public static CHAT_TYPE_HAND_ITEM_RECEIVED: number = 5;
    public static CHAT_TYPE_PETTREAT: number = 6;
    public static CHAT_TYPE_PETREVIVE: number = 7;
    public static CHAT_TYPE_PET_REBREED_FERTILIZE: number = 8;
    public static CHAT_TYPE_PET_SPEED_FERTILIZE: number = 9;
    public static CHAT_TYPE_MUTE_REMAINING: number = 10;
    // AIR 13 `SpecialSystemChat` (1971): RoomChatHandler.onSpecialSystemChat
    // dispatches chat type 12 with the specialSystemType in extraParam.
    public static CHAT_TYPE_SPECIAL_SYSTEM: number = 12;

    private _objectId: number;
    private _message: string;
    private _chatType: number;
    private _chatColours: string;
    private _links: string[];
    private _extraParam: number;
    private _style: number;
    private _nickIcon: string;
    private _bubbleWidthOverride: number;

    constructor(type: string, session: IRoomSession, objectId: number, message: string, chatType: number, style: number = 0, chatColours: string = '', links: string[] = null, extraParam: number = -1, nickIcon: string = '', bubbleWidthOverride: number = -1)
    {
        super(type, session);

        this._objectId = objectId;
        this._message = message;
        this._chatType = chatType;
        this._chatColours = chatColours;
        this._links = links;
        this._extraParam = extraParam;
        this._style = style;
        this._nickIcon = nickIcon;
        this._bubbleWidthOverride = bubbleWidthOverride;
    }

    public get objectId(): number
    {
        return this._objectId;
    }

    public get message(): string
    {
        return this._message;
    }

    public get chatType(): number
    {
        return this._chatType;
    }

    public get links(): string[]
    {
        return this._links;
    }

    public get extraParam(): number
    {
        return this._extraParam;
    }

    public get style(): number
    {
        return this._style;
    }

    public get chatColours(): string
    {
        return this._chatColours;
    }

    public get nickIcon(): string
    {
        return this._nickIcon;
    }

    /** -1 when the message follows the room setting; otherwise 0 wide, 1 normal, 2 thin. */
    public get bubbleWidthOverride(): number
    {
        return this._bubbleWidthOverride;
    }
}
