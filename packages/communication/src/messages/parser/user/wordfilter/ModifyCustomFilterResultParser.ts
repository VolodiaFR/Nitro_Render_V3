import { IMessageDataWrapper, IMessageParser } from '@octane/api';

/** ModifyCustomFilterResult (3333): result code followed by the word it refers to. */
export class ModifyCustomFilterResultParser implements IMessageParser
{
    private _result: number;
    private _word: string;

    public flush(): boolean
    {
        this._result = -1;
        this._word = '';

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._result = wrapper.readInt();
        this._word = wrapper.readString();

        return true;
    }

    public get result(): number
    {
        return this._result;
    }

    public get word(): string
    {
        return this._word;
    }
}
