import { describe, expect, it } from 'vitest';
import { IBinaryWriter } from '@octane/api';
import { BinaryReader, BinaryWriter } from '@octane/utils';
import { EvaWireDataWrapper } from '../../../codec/evawire/EvaWireDataWrapper';
import { GroupMembersRefreshParser } from './GroupMembersRefreshParser';

/** Builds the wrapper the codec hands a parser: a reader bounded to the frame body. */
const wrapperOf = (body: IBinaryWriter) =>
{
    const buffer = body.getBuffer() ?? new ArrayBuffer(0);

    return new EvaWireDataWrapper(2445, new BinaryReader(buffer));
};

describe('GroupMembersRefreshParser', () =>
{
    it('reads the group and the member it refers to', () =>
    {
        const parser = new GroupMembersRefreshParser();

        expect(parser.parse(wrapperOf(new BinaryWriter().writeInt(7).writeInt(42)))).toBe(true);
        expect(parser.groupId).toBe(7);
        expect(parser.userId).toBe(42);
    });

    it('rejects an empty frame instead of reading past the end', () =>
    {
        const parser = new GroupMembersRefreshParser();

        expect(() => parser.parse(wrapperOf(new BinaryWriter()))).not.toThrow();
        expect(parser.parse(wrapperOf(new BinaryWriter()))).toBe(false);
    });

    it('rejects a frame that carries the group but not the member', () =>
    {
        const parser = new GroupMembersRefreshParser();

        expect(() => parser.parse(wrapperOf(new BinaryWriter().writeInt(7)))).not.toThrow();
        expect(parser.parse(wrapperOf(new BinaryWriter().writeInt(7)))).toBe(false);
    });
});
