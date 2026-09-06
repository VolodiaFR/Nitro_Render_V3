import { Container, PointData, Texture } from 'pixi.js';
import { IRoomGeometry } from '../IRoomGeometry';
import { RoomObjectSpriteData } from '../RoomObjectSpriteData';
import { ISortableSprite } from '../object';
import { IRoomCanvasMouseListener } from './IRoomCanvasMouseListener';

export interface IRoomRenderingCanvas
{
    dispose(): void;
    initialize(width: number, height: number): void;
    setMask(flag: boolean): void;
    // `point` is the screen position that must stay under the cursor across the
    // transform change; `offsetPoint` is where it should land (defaults to `point`).
    setScale(scale: number, point?: PointData, offsetPoint?: PointData, isFlipForced?: boolean): void;
    setFlip(flag: boolean, point?: PointData, offsetPoint?: PointData): void;
    render(time: number, update?: boolean): void;
    update(): void;
    setMouseListener(listener: IRoomCanvasMouseListener): void;
    skipSpriteVisibilityChecking(): void;
    resumeSpriteVisibilityChecking(): void;
    getPlaneSortableSprites(): ISortableSprite[];
    handleMouseEvent(x: number, y: number, type: string, altKey: boolean, ctrlKey: boolean, shiftKey: boolean, buttonDown: boolean): boolean;
    getSortableSpriteList(): RoomObjectSpriteData[];
    getDisplayAsTexture(): Texture;
    moveLeft(): void;
    moveRight(): void;
    moveUp(): void;
    moveDown(): void;
    id: number;
    geometry: IRoomGeometry;
    master: Container;
    display: Container;
    screenOffsetX: number;
    screenOffsetY: number;
    scale: number;
    isFlipped: boolean;
    width: number;
    height: number;
    canvasUpdated: boolean;
}
