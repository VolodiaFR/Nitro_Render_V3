import { IMessageComposer } from '@octane/api';

export class RoomRemoveBackgroundComposer implements IMessageComposer<[]>
{
    public getMessageArray(): []
    {
        return [];
    }

    public dispose(): void
    {
        return;
    }
}
