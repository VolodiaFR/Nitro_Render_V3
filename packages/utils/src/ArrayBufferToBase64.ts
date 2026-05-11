export const ArrayBufferToBase64 = (buffer: ArrayBufferLike | Uint8Array) =>
{
    let binary = '';

    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    const len = bytes.byteLength;

    for(let i = 0; i < len; i++) (binary += String.fromCharCode(bytes[i]));

    return window.btoa(binary);
};
