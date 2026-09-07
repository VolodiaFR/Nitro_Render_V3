import { IMessageEvent } from '@octane/api';
import { MessageEvent } from '@octane/events';
import { ModifyCustomFilterResultParser } from '../../../parser';

export class ModifyCustomFilterResultEvent extends MessageEvent implements IMessageEvent
{
    /** The word could not be added or removed (already listed, empty, ...). */
    public static FAILED: number = 0;
    /** The word was added to the list. */
    public static ADDED: number = 1;
    /** The word was removed from the list. */
    public static REMOVED: number = 3;

    constructor(callBack: Function)
    {
        super(callBack, ModifyCustomFilterResultParser);
    }

    public getParser(): ModifyCustomFilterResultParser
    {
        return this.parser as ModifyCustomFilterResultParser;
    }
}
