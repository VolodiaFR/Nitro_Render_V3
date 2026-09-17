import { IMessageDataWrapper, IMessageParser } from '@octane/api';

export class GoToBreedingNestFailureParser implements IMessageParser
{
    public static PET_TOO_TIRED_TO_BREED: number = 6;

    private _reason: number;

    public flush(): boolean
    {
        this._reason = 0;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        if((typeof wrapper.remainingBytes === 'number') && (wrapper.remainingBytes < 4)) return false;

        this._reason = wrapper.readInt();

        return true;
    }

    public get reason(): number
    {
        return this._reason;
    }
}
