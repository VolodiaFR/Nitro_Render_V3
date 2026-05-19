import { fetchConfigJson } from './JsonParser';

export const DEFAULT_TIERS = [ 'core', 'custom', 'seasonal' ] as const;
export type GamedataTier = typeof DEFAULT_TIERS[number] | string;

export interface GamedataLoadOptions
{
    tiers?: readonly GamedataTier[];
    mergeArrayIdKeys?: readonly string[];
}

const DEFAULT_ID_KEYS = [ 'id', 'classname', 'name' ] as const;

const looksLikeDirectory = (url: string): boolean =>
{
    if(!url) return false;

    const stripped = url.split('?')[0].split('#')[0];

    return stripped.endsWith('/');
};

const joinUrl = (base: string, path: string): string =>
{
    const cleanBase = base.endsWith('/') ? base : `${ base }/`;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;

    return `${ cleanBase }${ cleanPath }`;
};

const tryFetchOrNull = async <T = any>(url: string): Promise<T | null> =>
{
    try
    {
        return await fetchConfigJson<T>(url);
    }
    catch
    {
        return null;
    }
};

const isPlainObject = (value: any): value is Record<string, any> => !!value && typeof value === 'object' && !Array.isArray(value);

const arrayItemsLookKeyed = (arr: any[], idKeys: readonly string[]): string | null =>
{
    if(!arr.length) return null;

    for(const key of idKeys)
    {
        let allHave = true;

        for(const item of arr)
        {
            if(!isPlainObject(item) || item[key] === undefined || item[key] === null)
            {
                allHave = false;
                break;
            }
        }

        if(allHave) return key;
    }

    return null;
};

export const mergeGamedata = (a: any, b: any, idKeys: readonly string[] = DEFAULT_ID_KEYS): any =>
{
    if(b === undefined) return a;
    if(a === undefined) return b;

    if(Array.isArray(a) && Array.isArray(b))
    {
        const idKey = arrayItemsLookKeyed(a, idKeys) || arrayItemsLookKeyed(b, idKeys);

        if(!idKey) return a.concat(b);

        const index = new Map<any, number>();
        const out: any[] = [];

        for(const item of a)
        {
            index.set(item[idKey], out.length);
            out.push(item);
        }

        for(const item of b)
        {
            const key = item[idKey];
            const at = index.get(key);

            if(at !== undefined)
            {
                out[at] = mergeGamedata(out[at], item, idKeys);
            }
            else
            {
                index.set(key, out.length);
                out.push(item);
            }
        }

        return out;
    }

    if(isPlainObject(a) && isPlainObject(b))
    {
        const out: Record<string, any> = { ...a };

        for(const k of Object.keys(b))
        {
            out[k] = mergeGamedata(a[k], b[k], idKeys);
        }

        return out;
    }

    return b;
};

interface TierManifest
{
    files?: string[];
}

interface RootManifest
{
    tiers?: GamedataTier[];
    files?: string[];
}

export const loadGamedata = async <T = any>(url: string, options: GamedataLoadOptions = {}): Promise<T> =>
{
    if(!url) throw new Error('loadGamedata: empty URL');

    if(!looksLikeDirectory(url))
    {
        return await fetchConfigJson<T>(url);
    }

    const idKeys = options.mergeArrayIdKeys ?? DEFAULT_ID_KEYS;
    const rootManifest = await tryFetchOrNull<RootManifest>(joinUrl(url, 'manifest.json5'))
        ?? await tryFetchOrNull<RootManifest>(joinUrl(url, 'manifest.json'));

    const tiers = (rootManifest?.tiers && rootManifest.tiers.length)
        ? rootManifest.tiers
        : (options.tiers ?? DEFAULT_TIERS);

    let merged: any = undefined;

    if(rootManifest?.files?.length)
    {
        for(const file of rootManifest.files)
        {
            const fileUrl = joinUrl(url, file);
            const part = await fetchConfigJson(fileUrl);
            merged = (merged === undefined) ? part : mergeGamedata(merged, part, idKeys);
        }
    }

    for(const tier of tiers)
    {
        const tierUrl = joinUrl(url, `${ tier }/`);
        const tierManifest = await tryFetchOrNull<TierManifest>(joinUrl(tierUrl, 'manifest.json5'))
            ?? await tryFetchOrNull<TierManifest>(joinUrl(tierUrl, 'manifest.json'));

        if(!tierManifest?.files?.length) continue;

        for(const file of tierManifest.files)
        {
            const fileUrl = joinUrl(tierUrl, file);
            const part = await fetchConfigJson(fileUrl);
            merged = (merged === undefined) ? part : mergeGamedata(merged, part, idKeys);
        }
    }

    if(merged === undefined) throw new Error(`loadGamedata: directory mode at "${ url }" produced no data — make sure at least one tier (core/custom/seasonal) has a manifest.json5 with a 'files' array`);

    return merged as T;
};
