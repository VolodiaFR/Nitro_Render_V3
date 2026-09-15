import { BinaryReader, BinaryWriter } from '@octane/utils';
import { describe, expect, it } from 'vitest';
import { EvaWireDataWrapper } from '../../../../codec/evawire/EvaWireDataWrapper';
import { BadgesParser } from './BadgesParser';

const packet = (modern: boolean): ArrayBuffer =>
{
    const writer = new BinaryWriter();

    writer.writeInt(2).writeInt(101).writeString('ACH_Alpha1');
    if(modern) writer.writeInt(37).writeInt(2);
    writer.writeInt(202).writeString('βeta');
    if(modern) writer.writeInt(91).writeInt(4);
    writer.writeInt(2).writeInt(1).writeString('ACH_Alpha1').writeInt(5).writeString('βeta');

    return writer.getBuffer();
};

const wrapper = (payload: ArrayBuffer) => new EvaWireDataWrapper(717, new BinaryReader(payload));

describe('BadgesParser wire schema compatibility', () =>
{
    it.each([true, false])('reads every record and equipped badge (modern=%s)', modern =>
    {
        const parser = new BadgesParser();
        const input = wrapper(packet(modern));

        expect(parser.parse(input)).toBe(true);
        expect(input.remainingBytes).toBe(0);
        expect(parser.getAllBadgeCodes()).toEqual(['ACH_Alpha1', 'βeta']);
        expect(parser.getActiveBadgeCodes()).toEqual(['ACH_Alpha1', 'βeta']);
        expect(parser.getBadgeId('βeta')).toBe(202);
        expect(parser.getBadgeDetails()).toEqual([
            { badgeId: 101, badgeCode: 'ACH_Alpha1', ownerCount: modern ? 37 : 0, badgeRarityId: modern ? 2 : 0 },
            { badgeId: 202, badgeCode: 'βeta', ownerCount: modern ? 91 : 0, badgeRarityId: modern ? 4 : 0 }
        ]);
    });

    it('accepts an empty inventory and resets prior state', () =>
    {
        const parser = new BadgesParser();
        const writer = new BinaryWriter();

        expect(parser.parse(wrapper(packet(true)))).toBe(true);
        writer.writeInt(0).writeInt(0);
        expect(parser.parse(wrapper(writer.getBuffer()))).toBe(true);
        expect(parser.getBadgeDetails()).toEqual([]);
        expect(parser.getAllBadgeCodes()).toEqual([]);
        expect(parser.getActiveBadgeCodes()).toEqual([]);
    });

    it.each([true, false])('rejects every truncated payload without partial state (modern=%s)', modern =>
    {
        const payload = packet(modern);
        const parser = new BadgesParser();

        for(let length = 0; length < payload.byteLength; length++)
        {
            expect(parser.parse(wrapper(payload.slice(0, length)))).toBe(false);
            expect(parser.getBadgeDetails()).toEqual([]);
            expect(parser.getAllBadgeCodes()).toEqual([]);
            expect(parser.getActiveBadgeCodes()).toEqual([]);
        }
    });

    it('rejects trailing bytes and impossible or negative record counts', () =>
    {
        const parser = new BadgesParser();
        const extra = new Uint8Array(packet(true).byteLength + 1);

        extra.set(new Uint8Array(packet(true)));
        expect(parser.parse(wrapper(extra.buffer))).toBe(false);

        for(const count of [-1, 2147483647])
        {
            const writer = new BinaryWriter();

            writer.writeInt(count).writeInt(0);
            expect(parser.parse(wrapper(writer.getBuffer()))).toBe(false);
        }
    });
});
