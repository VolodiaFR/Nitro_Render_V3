import { IMessageDataWrapper, IMessageParser } from '@octane/api';

export interface INickIconData
{
    iconKey: string;
    displayName: string;
    points: number;
    pointsType: number;
    owned: boolean;
    active: boolean;
    id: number;
}

export class UserNickIconsParser implements IMessageParser
{
    private _nickIcons: INickIconData[];

    public flush(): boolean
    {
        this._nickIcons = [];
        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._nickIcons = [];

        let count = wrapper.readInt();

        while(count > 0)
        {
            this._nickIcons.push({
                iconKey: wrapper.readString(),
                displayName: wrapper.readString(),
                points: wrapper.readInt(),
                pointsType: wrapper.readInt(),
                owned: (wrapper.readInt() === 1),
                active: (wrapper.readInt() === 1),
                id: wrapper.readInt()
            });

            count--;
        }

        return true;
    }

    public get nickIcons(): INickIconData[]
    {
        return this._nickIcons;
    }

}
