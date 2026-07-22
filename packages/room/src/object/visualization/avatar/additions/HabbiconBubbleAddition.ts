import { AvatarAction, IRoomObjectSprite } from '@nitrots/api';
import { GetConfiguration } from '@nitrots/configuration';
import { AvatarVisualization } from '../AvatarVisualization';
import { HabbiconAnimation, HabbiconAssetManager } from './HabbiconAssetManager';
import { IAvatarAddition } from './IAvatarAddition';

export class HabbiconBubbleAddition implements IAvatarAddition
{
    private _animation: HabbiconAnimation = null;
    private _startedAt: number = 0;
    private _small: boolean = false;
    private _durationMs: number = 3000;
    private _complete: boolean = false;

    constructor(
        private _id: number,
        private _habbiconId: number,
        private _visualization: AvatarVisualization)
    {}

    public dispose(): void
    {
        this._animation = null;
        this._visualization = null;
    }

    public update(sprite: IRoomObjectSprite, scale: number): void
    {
        if(!sprite) return;

        if(this._complete)
        {
            sprite.visible = false;
            return;
        }

        this._small = scale < 48;
        this._durationMs = Math.max(1, GetConfiguration().getValue<number>('habbicons.bubble.duration.ms', 3000));
        this._animation = HabbiconAssetManager.getInstance().getAnimation(this._habbiconId, this._small);

        const texture = this._animation?.frames[0]?.texture || HabbiconAssetManager.getInstance().getPreviewTexture(this._habbiconId, this._small);

        if(!texture)
        {
            sprite.visible = false;
            return;
        }

        let additionScale = 64;
        let offsetX = this._small ? -10 : -20;
        let offsetY = this._small ? -65 : -126;

        if(this._small) additionScale = 32;

        if(this._visualization.posture === AvatarAction.POSTURE_SIT) offsetY += (additionScale / 2);
        else if(this._visualization.posture === AvatarAction.POSTURE_LAY) offsetY += scale;

        sprite.visible = true;
        sprite.texture = texture;
        sprite.offsetX = offsetX;
        sprite.offsetY = offsetY;
        sprite.relativeDepth = -0.2;
        sprite.alpha = 255;

        if(!this._startedAt) this._startedAt = Date.now();
    }

    public animate(sprite: IRoomObjectSprite): boolean
    {
        if(!sprite) return false;

        if(!this._animation) this._animation = HabbiconAssetManager.getInstance().getAnimation(this._habbiconId, this._small);

        if(!this._animation)
        {
            const texture = HabbiconAssetManager.getInstance().getPreviewTexture(this._habbiconId, this._small);

            if(!texture) return false;

            sprite.texture = texture;
            sprite.relativeDepth = -0.2;
            sprite.alpha = 255;
            sprite.visible = true;
        }

        if(!sprite.visible) return false;

        const elapsed = Math.max(0, Date.now() - this._startedAt);
        const maxDuration = this._animation?.loop ? this._durationMs : (this._animation?.totalDurationMs || this._durationMs);

        if(elapsed >= maxDuration)
        {
            this._complete = true;
            sprite.visible = false;
            return true;
        }

        if(this._animation?.frames.length)
        {
            let stepTime = elapsed % this._animation.totalDurationMs;

            for(const frame of this._animation.frames)
            {
                if(stepTime < frame.durationMs)
                {
                    sprite.texture = frame.texture;
                    break;
                }

                stepTime -= frame.durationMs;
            }
        }

        return true;
    }

    public get id(): number
    {
        return this._id;
    }
}
