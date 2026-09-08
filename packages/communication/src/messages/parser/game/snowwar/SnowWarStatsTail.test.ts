import { IMessageDataWrapper } from '@octane/api';
import { describe, expect, it } from 'vitest';
import { UserCurrentBadgesParser } from '../../user/data/UserCurrentBadgesParser';
import { SnowWarLobbyTeamsParser } from './SnowWarLobbyTeamsParser';
import { SnowWarOnGameEndingParser } from './SnowWarOnGameEndingParser';

type Value = number | string | boolean;

const wrapperOf = (values: Value[]): IMessageDataWrapper =>
{
    let index = 0;
    const next = () => values[index++];

    return {
        readByte: () => next() as number,
        readBytes: () => null,
        readBoolean: () => next() as boolean,
        readShort: () => next() as number,
        readInt: () => next() as number,
        readFloat: () => next() as number,
        readDouble: () => next() as number,
        readString: () => next() as string,
        header: 0,
        get bytesAvailable()
        {
            return index < values.length;
        }
    };
};

describe('SnowWarOnGameEndingParser', () =>
{
    const teams: Value[] = [ 5, 2, 0, 12, 1, 7, 'Red', 12, 1, 3, 1, 9, 'Blue', 3 ];

    it('parses the legacy team block without the stats tail', () =>
    {
        const parser = new SnowWarOnGameEndingParser();
        parser.flush();

        expect(parser.parse(wrapperOf(teams))).toBe(true);
        expect(parser.secondsToResults).toBe(5);
        expect(parser.teams.map(team => team.score)).toEqual([ 12, 3 ]);
        expect(parser.hasPlayerStats).toBe(false);
        expect(parser.playerWithMostHits).toBe(0);
        expect(parser.teams[0].players[0].figure).toBeUndefined();
        expect(parser.teams[0].players[0].skillLevel).toBeUndefined();
    });

    it('merges the official Game2GameEnding stats tail into the player rows', () =>
    {
        const parser = new SnowWarOnGameEndingParser();
        parser.flush();

        const tail: Value[] = [ 7, 9, 2, 9, 'hd-180-1', 'M', 1, 0, 4, 7, 'hr-100-61', 'F', 6, 2, 12 ];

        expect(parser.parse(wrapperOf([ ...teams, ...tail ]))).toBe(true);
        expect(parser.hasPlayerStats).toBe(true);
        expect(parser.playerWithMostHits).toBe(7);
        expect(parser.playerWithMostKills).toBe(9);

        const red = parser.teams[0].players[0];
        expect(red.userId).toBe(7);
        expect(red.figure).toBe('hr-100-61');
        expect(red.gender).toBe('F');
        expect(red.snowballHits).toBe(6);
        expect(red.kills).toBe(2);
        expect(red.skillLevel).toBe(12);

        const blue = parser.teams[1].players[0];
        expect(blue.figure).toBe('hd-180-1');
        expect(blue.snowballHits).toBe(1);
        expect(blue.kills).toBe(0);
        expect(blue.skillLevel).toBe(4);
    });
});

describe('SnowWarLobbyTeamsParser', () =>
{
    const base: Value[] = [ 2, 2, 0, 7, 0, 'Red', 'hr-1', 'F', 0, 9, 1, 'Blue', 'hd-2', 'M', 7, 1, 1, 1, 'Arctic', true ];

    it('keeps the skill level undefined without the tail', () =>
    {
        const parser = new SnowWarLobbyTeamsParser();
        parser.flush();

        expect(parser.parse(wrapperOf(base))).toBe(true);
        expect(parser.players.map(player => player.skillLevel)).toEqual([ undefined, undefined ]);
    });

    it('reads the skill level tail into the matching players', () =>
    {
        const parser = new SnowWarLobbyTeamsParser();
        parser.flush();

        expect(parser.parse(wrapperOf([ ...base, 2, 9, 3, 7, 15 ]))).toBe(true);
        expect(parser.players.find(player => player.userId === 7).skillLevel).toBe(15);
        expect(parser.players.find(player => player.userId === 9).skillLevel).toBe(3);
    });
});

describe('UserCurrentBadgesParser', () =>
{
    it('reads the official (slot, code, ownerCount, rarity) layout', () =>
    {
        const parser = new UserCurrentBadgesParser();
        parser.flush();

        expect(parser.parse(wrapperOf([ 42, 2, 1, 'ACH_Login1', 120, 0, 2, 'HWAY1', 3, 4 ]))).toBe(true);
        expect(parser.userId).toBe(42);
        expect(parser.badges).toEqual([ 'ACH_Login1', 'HWAY1' ]);
        expect(parser.badgeDetails).toEqual([
            { slotId: 1, badgeCode: 'ACH_Login1', ownerCount: 120, badgeRarityId: 0 },
            { slotId: 2, badgeCode: 'HWAY1', ownerCount: 3, badgeRarityId: 4 }
        ]);
    });
});
