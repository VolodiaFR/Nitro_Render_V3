import { IMessageEvent } from '@nitrots/api';
import { MessageEvent } from '@nitrots/events';
import { TranslationLanguagesParser } from '../../parser';

export class TranslationLanguagesEvent extends MessageEvent implements IMessageEvent
{
    constructor(callBack: Function)
    {
        super(callBack, TranslationLanguagesParser);
    }

    public getParser(): TranslationLanguagesParser
    {
        return this.parser as TranslationLanguagesParser;
    }
}
