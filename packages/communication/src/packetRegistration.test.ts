import { describe, expect, it } from 'vitest';
import { packetCoverage } from '../../../scripts/packet-coverage.mjs';

describe('OctaneMessages registration', () =>
{
    const result = packetCoverage();

    it('registers every packet the code uses', () =>
    {
        // An unregistered composer is dropped with "Unknown Composer"; an unregistered event never fires.
        expect(result.unregisteredUsed.map(({ name }: { name: string }) => name)).toEqual([]);
    });

    it('registers every header once', () =>
    {
        expect(result.duplicateHeaders).toEqual([]);
    });
});
