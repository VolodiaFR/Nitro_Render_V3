import { inflate, inflateRaw } from 'pako';

/**
 * Habbo's .hab asset bundle (the HTML5 client's replacement for .swf):
 *
 * | offset | size | field                                  |
 * |--------|------|----------------------------------------|
 * | 0      | 4    | magic "HAB\0"                          |
 * | 4      | 2    | version (u16 LE), 1                    |
 * | 6      | 2    | flags (u16 LE)                         |
 * | 8      | 4    | compressed index length (u32 LE)       |
 * | 12     | 4    | uncompressed index length (u32 LE)     |
 * | 16     | 4    | data section length (u32 LE)           |
 * | 20     | ...  | zlib JSON index, then the data section |
 *
 * The index is { format: "hab", version, name, entries: [{ name, mimeType, offset, storedLength,
 * originalLength, compression? }] }; entry offsets count from the start of the data section.
 */
export interface HabBundleEntry
{
    name: string;
    mimeType: string;
    bytes: Uint8Array;
}

export interface HabBundleContents
{
    name: string;
    entries: HabBundleEntry[];
}

interface HabIndexEntry
{
    name: string;
    mimeType?: string;
    offset: number;
    storedLength: number;
    originalLength?: number;
    compression?: string;
}

const HEADER_LENGTH = 20;
const TEXT_DECODER = new TextDecoder('utf-8');

/** True when the bytes start with the "HAB\0" magic. */
export const isHabBundle = (buffer: ArrayBuffer): boolean =>
{
    if(!buffer || buffer.byteLength < HEADER_LENGTH) return false;

    const magic = new Uint8Array(buffer, 0, 4);

    return magic[0] === 0x48 && magic[1] === 0x41 && magic[2] === 0x42 && magic[3] === 0;
};

/** Reads every entry of a .hab bundle; every length is checked, so a damaged file fails loudly. */
export const readHabBundle = (buffer: ArrayBuffer): HabBundleContents =>
{
    if(!isHabBundle(buffer)) throw new Error('Not a HAB bundle (missing "HAB\\0" magic)');

    const view = new DataView(buffer);
    const indexLength = view.getUint32(8, true);
    const indexRawLength = view.getUint32(12, true);
    const dataLength = view.getUint32(16, true);
    const dataStart = HEADER_LENGTH + indexLength;

    if(dataStart + dataLength > buffer.byteLength) throw new Error('HAB bundle is shorter than its header says');

    const indexBytes = inflate(new Uint8Array(buffer, HEADER_LENGTH, indexLength));

    if(indexRawLength && indexBytes.byteLength !== indexRawLength) throw new Error('HAB index has the wrong length');

    const index = JSON.parse(TEXT_DECODER.decode(indexBytes)) as { format?: string; name?: string; entries?: HabIndexEntry[] };

    if(index?.format !== 'hab' || !Array.isArray(index.entries)) throw new Error('HAB index is not a "hab" index');

    const entries: HabBundleEntry[] = index.entries.map(entry =>
    {
        if(entry.offset < 0 || entry.storedLength < 0 || entry.offset + entry.storedLength > dataLength)
            throw new Error(`HAB entry "${ entry.name }" lies outside the data section`);

        const stored = new Uint8Array(buffer, dataStart + entry.offset, entry.storedLength);
        const bytes = entry.compression === 'deflate' ? inflateEntry(stored) : stored.slice();

        if(entry.originalLength !== undefined && bytes.byteLength !== entry.originalLength)
            throw new Error(`HAB entry "${ entry.name }" has the wrong length`);

        return { name: entry.name, mimeType: entry.mimeType ?? '', bytes };
    });

    return { name: index.name ?? '', entries };
};

/** Habbo stores zlib streams; a raw deflate stream is accepted too. */
const inflateEntry = (stored: Uint8Array): Uint8Array =>
{
    try
    {
        return inflate(stored);
    }
    catch
    {
        return inflateRaw(stored);
    }
};
