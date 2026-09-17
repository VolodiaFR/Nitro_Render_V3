import { describe, expect, it } from 'vitest';
import { IBinaryWriter } from '@octane/api';
import { BinaryReader, BinaryWriter } from '@octane/utils';
import { EvaWireDataWrapper } from '../../../codec/evawire/EvaWireDataWrapper';
import { GroupMemberUpdateParser } from './GroupMemberUpdateParser';
import { GroupRank } from './utils';

/** Builds the wrapper the codec hands a parser: a reader bounded to the frame body. */
const wrapperOf = (body: IBinaryWriter) =>
{
    const buffer = body.getBuffer() ?? new ArrayBuffer(0);

    return new EvaWireDataWrapper(265, new BinaryReader(buffer));
};

describe('GroupMemberUpdateParser', () =>
{
    it('reads the group id and the member record behind it', () =>
    {
        const body = new BinaryWriter();
        body.writeInt(7);
        body.writeInt(GroupRank.ADMIN);
        body.writeInt(42);
        body.writeString('Bob');
        body.writeString('hd-1-1');
        body.writeString('01-01-2026');

        const parser = new GroupMemberUpdateParser();

        expect(parser.parse(wrapperOf(body))).toBe(true);
        expect(parser.groupId).toBe(7);
        expect(parser.member.id).toBe(42);
        expect(parser.member.name).toBe('Bob');
        expect(parser.member.rank).toBe(GroupRank.ADMIN);
    });

    it('rejects an empty frame instead of reading past the end', () =>
    {
        const parser = new GroupMemberUpdateParser();

        expect(() => parser.parse(wrapperOf(new BinaryWriter()))).not.toThrow();
        expect(parser.parse(wrapperOf(new BinaryWriter()))).toBe(false);
    });

    it('rejects a frame whose member record is truncated', () =>
    {
        const truncated = () =>
        {
            const body = new BinaryWriter();
            body.writeInt(7);
            body.writeInt(GroupRank.ADMIN);
            body.writeInt(42);

            return wrapperOf(body);
        };

        const parser = new GroupMemberUpdateParser();

        expect(() => parser.parse(truncated())).not.toThrow();
        expect(parser.parse(truncated())).toBe(false);
        expect(parser.member).toBeNull();
    });
});
