export const ALPN = "mark";
export const DefaultPort = 6309;
export const ProtocolVersion = "1.0";

export const WellKnownManifestPath = "/.well-known/agent-manifest.md";

export const MaxMetaKeys = 10;
export const MaxMetaBytes = 512;
export const ValidMetaKeyRegex = /^[a-z0-9-]+$/;

export const FrontmatterStart = '---\n';
export const FrontmatterDelimiter = '\n---\n';

export class DemarkusProtocolUtilities {

    // only: lowercase letters, digits, and hyphens.
    public static isValidMetaKey(key: string): boolean {
        if (!key || key.length === 0) {
            return false;
        }

        if (!ValidMetaKeyRegex.test(key)) {
            return false;
        }

        return true;
    }

    public static isValidMetaValue(value: string): boolean {
        return !value.includes('\r\n');
    }

    public static async getDataFromStream(input: ReadableStream | Buffer | string): Promise<Buffer> {
        if (typeof input === 'string') {
            return Promise.resolve(Buffer.from(input));
        }

        if(Buffer.isBuffer(input)) {
            return Promise.resolve(input);
        }

        return Buffer.from(await Bun.readableStreamToArrayBuffer(input));
    }
}