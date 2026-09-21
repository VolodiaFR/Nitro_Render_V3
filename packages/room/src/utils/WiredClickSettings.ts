import { RoomObjectCategory } from '@octane/api';

/** What clicking another avatar does while a wired click setting is on. */
export const WIRED_CLICK_USER_DEFAULT = 0;
/** The click still reaches the avatar, and the player walks to the tile behind it. */
export const WIRED_CLICK_USER_WALK_BEHIND = 1;
/** Avatars cannot be clicked: the click lands on the tile under them. */
export const WIRED_CLICK_USER_PASS_THROUGH = 2;

/** What clicking furni does while a wired click setting is on. */
export const WIRED_CLICK_FURNI_DEFAULT = 0;
/** Furni cannot be clicked: the click lands on the tile under it. */
export const WIRED_CLICK_FURNI_PASS_THROUGH = 1;

export interface WiredClickSettings
{
    userOption: number;
    furniOption: number;
}

export const DEFAULT_WIRED_CLICK_SETTINGS: Readonly<WiredClickSettings> = Object.freeze({ userOption: WIRED_CLICK_USER_DEFAULT, furniOption: WIRED_CLICK_FURNI_DEFAULT });

export type WiredClickBehaviour = 'default' | 'pass-through' | 'walk-behind';

/** Keeps a setting inside the values the server can send; anything else is the default. */
export const normalizeWiredClickSettings = (userOption: number, furniOption: number): WiredClickSettings =>
{
    const user = (userOption === WIRED_CLICK_USER_WALK_BEHIND || userOption === WIRED_CLICK_USER_PASS_THROUGH) ? userOption : WIRED_CLICK_USER_DEFAULT;
    const furni = (furniOption === WIRED_CLICK_FURNI_PASS_THROUGH) ? furniOption : WIRED_CLICK_FURNI_DEFAULT;

    return { userOption: user, furniOption: furni };
};

/** What a plain click on an object of this category does under the settings. */
export const resolveWiredClickBehaviour = (category: number, settings: Readonly<WiredClickSettings>): WiredClickBehaviour =>
{
    if(category === RoomObjectCategory.UNIT)
    {
        if(settings.userOption === WIRED_CLICK_USER_PASS_THROUGH) return 'pass-through';
        if(settings.userOption === WIRED_CLICK_USER_WALK_BEHIND) return 'walk-behind';

        return 'default';
    }

    if(category === RoomObjectCategory.FLOOR)
    {
        return (settings.furniOption === WIRED_CLICK_FURNI_PASS_THROUGH) ? 'pass-through' : 'default';
    }

    return 'default';
};

/** The eight room directions as tile steps, 0 pointing up the screen and turning clockwise. */
const DIRECTION_STEPS: ReadonlyArray<readonly [number, number]> = [
    [ 0, -1 ], [ 1, -1 ], [ 1, 0 ], [ 1, 1 ], [ 0, 1 ], [ -1, 1 ], [ -1, 0 ], [ -1, -1 ]
];

/**
 * The tile behind an avatar standing at (x, y) and facing `directionDegrees`, as the room object
 * stores a direction (a multiple of 45 degrees).
 */
export const tileBehind = (x: number, y: number, directionDegrees: number): { x: number; y: number } =>
{
    const direction = ((Math.round(directionDegrees / 45) % 8) + 8) % 8;
    const [ stepX, stepY ] = DIRECTION_STEPS[direction];

    return { x: x - stepX, y: y - stepY };
};
