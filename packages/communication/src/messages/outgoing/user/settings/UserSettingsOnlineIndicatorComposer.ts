import { IMessageComposer } from '@octane/api';

/**
 * Official AIR 13 friend-online notification preference composer (header 818):
 * 0 everyone, 1 users in my relationship status, 2 nobody.
 */
export class UserSettingsOnlineIndicatorComposer implements IMessageComposer<ConstructorParameters<typeof UserSettingsOnlineIndicatorComposer>>
{
    private _data: ConstructorParameters<typeof UserSettingsOnlineIndicatorComposer>;

    constructor(preference: number)
    {
        this._data = [ preference ];
    }

    public getMessageArray()
    {
        return this._data;
    }

    public dispose(): void
    {
        return;
    }
}
