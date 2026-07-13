import { NitroEvent } from './NitroEvent';

export class SocketReauthenticatedEvent extends NitroEvent
{
    constructor(type: string, public readonly sessionResumed: boolean, public readonly roomId: number)
    {
        super(type);
    }
}
