import { IMessageDataWrapper } from '@octane/api';

export const readBoundedCatalogCount = (wrapper: IMessageDataWrapper, minBytesPerEntry: number, field: string): number =>
{
    const count = wrapper.readInt();

    if(count < 0) throw new Error(`Catalog packet ${ field } count ${ count } is invalid`);

    const remaining = wrapper.remainingBytes;

    if((typeof remaining === 'number') && ((count * minBytesPerEntry) > remaining))
    {
        throw new Error(`Catalog packet truncated: ${ count } ${ field } entries cannot fit in ${ remaining } remaining bytes`);
    }

    return count;
};
