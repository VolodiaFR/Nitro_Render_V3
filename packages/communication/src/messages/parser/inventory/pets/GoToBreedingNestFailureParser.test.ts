import { describe, expect, it } from 'vitest';
import { IBinaryWriter } from '@octane/api';
import { BinaryReader, BinaryWriter } from '@octane/utils';
import { EvaWireDataWrapper } from '../../../../codec/evawire/EvaWireDataWrapper';
import { GoToBreedingNestFailureParser } from './GoToBreedingNestFailureParser';

/** Builds the wrapper the codec hands a parser: a reader bounded to the frame body. */
const wrapperOf = (body: IBinaryWriter) =>
{
    const buffer = body.getBuffer() ?? new ArrayBuffer(0);

    return new EvaWireDataWrapper(2621, new BinaryReader(buffer));
};

describe('GoToBreedingNestFailureParser', () =>
{
    it('reads the failure reason', () =>
    {
        const parser = new GoToBreedingNestFailureParser();

        expect(parser.flush()).toBe(true);
        expect(parser.parse(wrapperOf(new BinaryWriter().writeInt(GoToBreedingNestFailureParser.PET_TOO_TIRED_TO_BREED)))).toBe(true);
        expect(parser.reason).toBe(GoToBreedingNestFailureParser.PET_TOO_TIRED_TO_BREED);
    });

    it('rejects a frame that carries no reason instead of reading past the end', () =>
    {
        const parser = new GoToBreedingNestFailureParser();

        parser.flush();

        expect(() => parser.parse(wrapperOf(new BinaryWriter()))).not.toThrow();
        expect(parser.parse(wrapperOf(new BinaryWriter()))).toBe(false);
    });

    it('rejects a frame whose reason is truncated', () =>
    {
        const parser = new GoToBreedingNestFailureParser();

        parser.flush();

        expect(() => parser.parse(wrapperOf(new BinaryWriter().writeShort(0)))).not.toThrow();
        expect(parser.parse(wrapperOf(new BinaryWriter().writeShort(0)))).toBe(false);
    });
});
