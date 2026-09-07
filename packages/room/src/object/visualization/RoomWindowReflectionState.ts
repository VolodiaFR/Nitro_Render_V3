import { IVector3D } from '@octane/api';
import { Vector3d } from '@octane/utils';
import { Texture } from 'pixi.js';

interface IWindowReflectionAvatarState
{
    id: number;
    texture: Texture;
    location: IVector3D;
    verticalOffset: number;
    direction: number;
    oppositeTexture: Texture;
    roomId: string;
}

export interface IWindowReflectionUnitLayer
{
    texture: Texture;
    offsetX: number;
    offsetY: number;
    alpha: number;
    flipH: boolean;
}

export interface IWindowReflectionUnitState
{
    id: number;
    layersX: IWindowReflectionUnitLayer[];
    layersY: IWindowReflectionUnitLayer[];
    location: IVector3D;
    roomId: string;
}

export class RoomWindowReflectionState
{
    private static _avatars: Map<string, IWindowReflectionAvatarState> = new Map();
    private static _units: Map<string, IWindowReflectionUnitState> = new Map();
    private static _zones: Map<object, { location: IVector3D; normal: IVector3D; roomId: string }> = new Map();
    private static _updateId: number = 0;

    private static key(id: number, roomId: string): string
    {
        return ((roomId || '') + '|' + id);
    }

    private static matchesRoom(entryRoomId: string, roomId: string): boolean
    {
        return (!roomId || !entryRoomId || (entryRoomId === roomId));
    }

    public static registerZone(owner: object, location: IVector3D, normal: IVector3D, roomId: string = null): void
    {
        this._zones.set(owner, { location, normal, roomId });
    }

    public static unregisterZone(owner: object): void
    {
        this._zones.delete(owner);
    }

    public static get hasZones(): boolean
    {
        return (this._zones.size > 0);
    }

    private static planeDistance(location: IVector3D, planeLocation: IVector3D, normal: IVector3D): number
    {
        const length = normal.length;

        if(length <= 0) return Number.POSITIVE_INFINITY;

        const dot = (((location.x - planeLocation.x) * normal.x) + ((location.y - planeLocation.y) * normal.y) + ((location.z - planeLocation.z) * normal.z));

        return Math.abs(dot / length);
    }

    public static isNearAnyZone(location: IVector3D, roomId: string = null, range: number = 0.8): boolean
    {
        if(!location || !this._zones.size) return false;

        for(const zone of this._zones.values())
        {
            if(!this.matchesRoom(zone.roomId, roomId)) continue;

            if(this.planeDistance(location, zone.location, zone.normal) <= range) return true;
        }

        return false;
    }

    public static hasEntryNear(planeLocation: IVector3D, normal: IVector3D, roomId: string = null, range: number = 0.8): boolean
    {
        if(!planeLocation || !normal) return false;

        for(const avatar of this._avatars.values())
        {
            if(!avatar.location || !this.matchesRoom(avatar.roomId, roomId)) continue;

            if(this.planeDistance(avatar.location, planeLocation, normal) <= range) return true;
        }

        for(const unit of this._units.values())
        {
            if(!unit.location || !this.matchesRoom(unit.roomId, roomId)) continue;

            if(this.planeDistance(unit.location, planeLocation, normal) <= range) return true;
        }

        return false;
    }

    public static setUnit(id: number, layersX: IWindowReflectionUnitLayer[], layersY: IWindowReflectionUnitLayer[], location: IVector3D, roomId: string = null): void
    {
        if(!layersX?.length || !layersY?.length || !location) return;

        this._units.set(this.key(id, roomId), { id, layersX, layersY, location, roomId });

        this._updateId++;
    }

    public static removeUnit(id: number, roomId: string = null): void
    {
        if(this._units.delete(this.key(id, roomId))) this._updateId++;
    }

    public static getUnits(roomId: string = null): IWindowReflectionUnitState[]
    {
        return Array.from(this._units.values()).filter(unit => this.matchesRoom(unit.roomId, roomId));
    }

    public static getUnit(id: number, roomId: string = null): IWindowReflectionUnitState
    {
        return (this._units.get(this.key(id, roomId)) || this._units.get(this.key(id, null)) || null);
    }

    public static getAvatarLocation(id: number, roomId: string = null): IVector3D
    {
        return ((this._avatars.get(this.key(id, roomId)) || this._avatars.get(this.key(id, null)))?.location || null);
    }

    public static setAvatar(id: number, texture: Texture, location: IVector3D, verticalOffset: number = 0, direction: number = 0, oppositeTexture: Texture = null, roomId: string = null): void
    {
        if(!texture || !location) return;

        const storedLocation = new Vector3d();

        storedLocation.assign(location);

        this._avatars.set(this.key(id, roomId), {
            id,
            texture,
            location: storedLocation,
            verticalOffset,
            direction,
            oppositeTexture: (oppositeTexture || texture),
            roomId
        });

        this._updateId++;
    }

    public static removeAvatar(id: number, roomId: string = null): void
    {
        if(this._avatars.delete(this.key(id, roomId))) this._updateId++;
    }

    public static getAvatars(roomId: string = null): IWindowReflectionAvatarState[]
    {
        return Array.from(this._avatars.values()).filter(avatar => this.matchesRoom(avatar.roomId, roomId));
    }

    public static get updateId(): number
    {
        return this._updateId;
    }

    public static clearRoom(roomId: string): void
    {
        let removed = false;

        for(const [key, unit] of this._units)
        {
            if(!unit.roomId || !roomId || (unit.roomId === roomId))
            {
                this._units.delete(key);

                removed = true;
            }
        }

        for(const [key, avatar] of this._avatars)
        {
            if(!avatar.roomId || !roomId || (avatar.roomId === roomId))
            {
                this._avatars.delete(key);

                removed = true;
            }
        }

        if(removed) this._updateId++;
    }
}
