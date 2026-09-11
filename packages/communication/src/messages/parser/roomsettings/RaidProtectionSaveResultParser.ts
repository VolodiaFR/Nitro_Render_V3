import { IMessageDataWrapper, IMessageParser } from '@octane/api';
import { RaidProtectionSettingsParser } from './RaidProtectionSettingsParser';

/**
 * The answer to a raid protection save.
 *
 * The field order is not the obvious one: the room id comes first, then the result code, and only
 * then the rest of the settings snapshot. The room id is sent once, not twice.
 *
 * Result code 0 is success and closes the panel; the other codes leave it open.
 */
export class RaidProtectionSaveResultParser implements IMessageParser
{
    public static readonly RESULT_OK: number = 0;

    private _resultCode: number;
    private _settings: RaidProtectionSettingsParser;

    public flush(): boolean
    {
        this._resultCode = 0;
        this._settings = new RaidProtectionSettingsParser();
        this._settings.flush();

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        const roomId = wrapper.readInt();

        this._resultCode = wrapper.readInt();

        this._settings = new RaidProtectionSettingsParser();
        this._settings.flush();
        this._settings.setRoomId(roomId);

        return this._settings.parseAfterRoomId(wrapper);
    }

    public get succeeded(): boolean
    {
        return this._resultCode === RaidProtectionSaveResultParser.RESULT_OK;
    }

    public get resultCode(): number
    {
        return this._resultCode;
    }

    public get settings(): RaidProtectionSettingsParser
    {
        return this._settings;
    }
}
