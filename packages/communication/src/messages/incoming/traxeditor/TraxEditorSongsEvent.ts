import { IMessageEvent } from '@nitrots/api';
import { MessageEvent } from '@nitrots/events';
import { TraxEditorSongsParser } from '../../parser';

export class TraxEditorSongsEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, TraxEditorSongsParser);
    }

    public getParser(): TraxEditorSongsParser
    {
        return this.parser as TraxEditorSongsParser;
    }
}
