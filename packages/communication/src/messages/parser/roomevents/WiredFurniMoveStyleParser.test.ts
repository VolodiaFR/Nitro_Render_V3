import { BinaryReader, BinaryWriter } from '@octane/utils';
import { describe, expect, it } from 'vitest';
import { WiredFurniMoveStyleParser } from './WiredFurniMoveStyleParser';

class TestWrapper
{
    constructor(private reader: BinaryReader)
    {}
    readByte()
    {
        return this.reader.readByte();
    }
    readBoolean()
    {
        return this.reader.readByte() === 1;
    }
    readShort()
    {
        return this.reader.readShort();
    }
    readInt()
    {
        return this.reader.readInt();
    }
    readString()
    {
        const length = this.reader.readShort(); return this.reader.readBytes(length).toString();
    }
    header = 0;
    get bytesAvailable()
    {
        return this.reader.remaining() > 0;
    }
    get remainingBytes()
    {
        return this.reader.remaining();
    }
}

const wrapper = (writer: BinaryWriter) => new TestWrapper(new BinaryReader(writer.getBuffer())) as any;

describe('WiredFurniMoveStyleParser', () =>
{
    it('parses and clamps a valid style hint', () =>
    {
        const writer = new BinaryWriter();
        writer.writeInt(2); writer.writeInt(42); writer.writeInt(43); writer.writeInt(9); writer.writeInt(250);
        const parser = new WiredFurniMoveStyleParser();

        expect(parser.parse(wrapper(writer))).toBe(true);
        expect(parser.itemIds).toEqual([ 42, 43 ]);
        expect(parser.style).toBe(7);
        // Clamped to the jump style, whose intensity is a signed strength rather than a percentage.
        expect(parser.intensity).toBe(250);
    });

    it('keeps an easing intensity within 0-100 and a jump strength signed', () =>
    {
        const easing = new BinaryWriter();
        easing.writeInt(1); easing.writeInt(42); easing.writeInt(4); easing.writeInt(250);
        const easingParser = new WiredFurniMoveStyleParser();

        expect(easingParser.parse(wrapper(easing))).toBe(true);
        expect(easingParser.intensity).toBe(100);

        const jump = new BinaryWriter();
        jump.writeInt(1); jump.writeInt(42); jump.writeInt(7); jump.writeInt(-80);
        const jumpParser = new WiredFurniMoveStyleParser();

        expect(jumpParser.parse(wrapper(jump))).toBe(true);
        expect(jumpParser.style).toBe(WiredFurniMoveStyleParser.STYLE_JUMP);
        expect(jumpParser.intensity).toBe(-80);
    });

    it('rejects oversized counts before looping', () =>
    {
        const writer = new BinaryWriter();
        writer.writeInt(1001);
        expect(new WiredFurniMoveStyleParser().parse(wrapper(writer))).toBe(false);
    });

    it('rejects non-positive item ids and truncated payloads', () =>
    {
        const invalidId = new BinaryWriter();
        invalidId.writeInt(1); invalidId.writeInt(0); invalidId.writeInt(6); invalidId.writeInt(100);
        expect(new WiredFurniMoveStyleParser().parse(wrapper(invalidId))).toBe(false);

        const truncated = new BinaryWriter();
        truncated.writeInt(1); truncated.writeInt(42);
        const parser = new WiredFurniMoveStyleParser();
        expect(parser.parse(wrapper(truncated))).toBe(false);
        expect(parser.itemIds).toEqual([]);
    });

    it('reads the trailing overshoot and kind, and defaults them for the original layout', () =>
    {
        const legacy = new BinaryWriter();
        legacy.writeInt(1); legacy.writeInt(42); legacy.writeInt(7); legacy.writeInt(80);
        const legacyParser = new WiredFurniMoveStyleParser();

        expect(legacyParser.parse(wrapper(legacy))).toBe(true);
        expect(legacyParser.overshoot).toBe(0);
        expect(legacyParser.kind).toBe(WiredFurniMoveStyleParser.KIND_FURNI);

        const extended = new BinaryWriter();
        extended.writeInt(1); extended.writeInt(42); extended.writeInt(0); extended.writeInt(0); extended.writeInt(-99); extended.writeInt(1);
        const parser = new WiredFurniMoveStyleParser();

        expect(parser.parse(wrapper(extended))).toBe(true);
        expect(parser.overshoot).toBe(WiredFurniMoveStyleParser.OVERSHOOT_MIN);
        expect(parser.kind).toBe(WiredFurniMoveStyleParser.KIND_UNIT);

        const unknownKind = new BinaryWriter();
        unknownKind.writeInt(1); unknownKind.writeInt(42); unknownKind.writeInt(7); unknownKind.writeInt(50); unknownKind.writeInt(3); unknownKind.writeInt(9);
        const unknownParser = new WiredFurniMoveStyleParser();

        expect(unknownParser.parse(wrapper(unknownKind))).toBe(true);
        expect(unknownParser.overshoot).toBe(3);
        expect(unknownParser.kind).toBe(WiredFurniMoveStyleParser.KIND_FURNI);
    });
});
