import { SecurityLevel } from '@octane/api';
import { describe, expect, it } from 'vitest';
import { SessionDataManager } from '../SessionDataManager';

const manager = (securityLevel: number, permissions: [string, number][]) =>
{
    const instance = Object.create(SessionDataManager.prototype) as SessionDataManager;

    Object.assign(instance, { _securityLevel: securityLevel, _permissions: new Map(permissions) });

    return instance;
};

describe('SessionDataManager.hasPermission', () =>
{
    it('follows the keys the server sent, whatever the rank level', () =>
    {
        const staffWithoutKey = manager(SecurityLevel.SUPER_USER, [ [ 'acc_debug', 1 ] ]);
        const userWithKey = manager(SecurityLevel.NONE, [ [ 'acc_anyroomowner', 1 ] ]);

        expect(staffWithoutKey.hasPermission('acc_anyroomowner', SecurityLevel.MODERATOR)).toBe(false);
        expect(userWithKey.hasPermission('acc_anyroomowner', SecurityLevel.MODERATOR)).toBe(true);
        expect(userWithKey.isAnyRoomController).toBe(true);
    });

    it('treats a room-owner-only key as not allowed', () =>
    {
        expect(manager(SecurityLevel.NONE, [ [ 'acc_anyroomowner', 2 ] ]).hasPermission('acc_anyroomowner', SecurityLevel.MODERATOR)).toBe(false);
    });

    it('falls back to the rank level when the server sent no keys', () =>
    {
        expect(manager(SecurityLevel.MODERATOR, []).isAnyRoomController).toBe(true);
        expect(manager(SecurityLevel.EMPLOYEE, []).isAnyRoomController).toBe(false);
    });
});
