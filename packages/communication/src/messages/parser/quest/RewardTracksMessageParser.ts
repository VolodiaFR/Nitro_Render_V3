import { IMessageDataWrapper, IMessageParser } from '@octane/api';
import { RewardTrackData } from './RewardTrackData';

/** RewardTracks (2327): every active track; `disabled` wipes them, `reload` rebuilds the windows. */
export class RewardTracksMessageParser implements IMessageParser
{
    private _disabled: boolean;
    private _tracks: RewardTrackData[];
    private _reload: boolean;

    public flush(): boolean
    {
        this._disabled = false;
        this._tracks = [];
        this._reload = false;

        return true;
    }

    public parse(wrapper: IMessageDataWrapper): boolean
    {
        if(!wrapper) return false;

        this._disabled = wrapper.readBoolean();

        const count = wrapper.readInt();

        for(let i = 0; i < count; i++) this._tracks.push(new RewardTrackData(wrapper));

        this._reload = wrapper.readBoolean();

        return true;
    }

    public get disabled(): boolean
    {
        return this._disabled;
    }

    public get tracks(): RewardTrackData[]
    {
        return this._tracks;
    }

    public get reload(): boolean
    {
        return this._reload;
    }
}
