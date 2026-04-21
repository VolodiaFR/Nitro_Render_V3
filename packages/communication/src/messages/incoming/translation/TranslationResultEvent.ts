import { IMessageEvent } from '@nitrots/api';
import { MessageEvent } from '@nitrots/events';
import { TranslationResultParser } from '../../parser';

export class TranslationResultEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, TranslationResultParser);
    }

    public getParser(): TranslationResultParser
    {
        return this.parser as TranslationResultParser;
    }
}
