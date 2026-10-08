import { FurnitureType } from '@octane/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const downloadAsset = vi.fn<(url: string) => Promise<boolean>>();
const config: Record<string, unknown> = {};

vi.mock('@octane/assets', async importOriginal => ({
    ...(await importOriginal<object>()),
    GetAssetManager: () => ({ downloadAsset, getCollection: () => null })
}));

vi.mock('@octane/configuration', async importOriginal => ({
    ...(await importOriginal<object>()),
    GetConfiguration: () => ({ getValue: (key: string, fallback?: unknown) => (key in config ? config[key] : fallback) })
}));

vi.mock('@octane/session', async importOriginal => ({
    ...(await importOriginal<object>()),
    GetSessionDataManager: () => ({ getAllFurnitureData: () => [
        { type: FurnitureType.WALL, id: 1, className: 'landscape', revision: 1 },
        { type: FurnitureType.FLOOR, id: 2, className: 'party_nt_shelf', revision: 1 }
    ] })
}));

const { RoomContentLoader } = await import('../RoomContentLoader');

describe('RoomContentLoader start-up', () =>
{
    beforeEach(() =>
    {
        downloadAsset.mockReset();
        for(const key of Object.keys(config)) delete config[key];
        config['furni.asset.url'] = 'http://cdn/hab/%libname%.hab';
    });

    it('starts when one library fails to load', async () =>
    {
        downloadAsset.mockImplementation(async url =>
        {
            if(url.includes('landscape')) throw new Error('broken landscape');
            return true;
        });

        const loader = new RoomContentLoader();

        await expect(loader.init()).resolves.toBeUndefined();
        expect(downloadAsset).toHaveBeenCalledWith('http://cdn/hab/landscape.hab');
        expect(downloadAsset).toHaveBeenCalledWith('local://room');
    });
});
