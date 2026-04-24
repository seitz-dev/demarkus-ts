import { YAML } from "bun";
import { DemarkusRequestHeader, type DemarkusRequestHeaderOpts } from "./header";
import { DemarkusRequestPayload, type DemarkusRequestPayloadOpts } from "./payload";
import { DemarkusProtocolUtilities } from "../protocol";

export class DemarkusRequest {
    private requestHeader: DemarkusRequestHeader;
    private requestPayload: DemarkusRequestPayload;

    constructor(requestHeaderOpts: DemarkusRequestHeaderOpts, requestPayloadOpts: DemarkusRequestPayloadOpts) {
        this.requestHeader = new DemarkusRequestHeader(requestHeaderOpts);
        this.requestPayload = new DemarkusRequestPayload(requestPayloadOpts);
    }

    get header() {
        return this.requestHeader;
    }

    get verb() {
        return this.header.opts.verb;
    }

    get path() {
        return this.header.opts.path;
    }

    get payload() {
        return this.requestPayload;
    }

    get body() {
        return this.requestPayload.body;
    }

    get metaData() {
        return this.requestPayload.metaData;
    }

    static async parse(input: ReadableStream | Buffer | string): Promise<DemarkusRequest> {
        // read header line
        const data = await DemarkusProtocolUtilities.getDataFromStream(input);

        const content = data.toString('utf-8');
        const lines = content.split('\n');

        if (lines.length === 0) {
            throw new Error('Empty request');
        }

        const firstLine = lines[0];

        if (!firstLine) {
            throw new Error('Invalid request');
        }

        const header = DemarkusRequestHeader.parse(firstLine);
        const dataStartIndex = data.indexOf('\n') + 1;
        const body = DemarkusRequestPayload.parse(data.subarray(dataStartIndex).toString('utf-8'));

        return new DemarkusRequest(header.opts, body);
    }

    public serialize(): Buffer {
        let output = `${this.verb} ${this.path}\n`;

        if (this.metaData && Object.keys(this.metaData).length > 0) {
            output += "---\n";
            output += Bun.YAML.stringify(this.metaData).trim() + "\n";
            output += "---\n";
        }

        if (this.body) {
            output += this.body;
            // If there's a body, we just send it as is
        }

        return Buffer.from(output, 'utf-8');
    }

    /** @internal */
    static _containsControlChars(s: string): boolean {
        return /[\x00-\x08\x0a-\x1f\x7f]/.test(s);
    }
}