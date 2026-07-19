import { IMessageEvent } from '@nitrots/api';
import { MessageEvent } from '@nitrots/events';
import { TraxEditorErrorParser } from '../../parser';

export class TraxEditorErrorEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, TraxEditorErrorParser);
    }

    public getParser(): TraxEditorErrorParser
    {
        return this.parser as TraxEditorErrorParser;
    }
}
