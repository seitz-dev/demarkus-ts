import { DemarkusRequestHeader, type DemarkusRequestHeaderOpts } from "./header";
import { DemarkusRequestPayload, type DemarkusRequestPayloadOpts } from "./payload";
import { DemarkusRequestSerializer } from "./serializer";
import { DemarkusRequestParser } from "./parser";

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
        return new DemarkusRequestParser().parse(input);
    }

    public serialize(): Buffer {
        return new DemarkusRequestSerializer().serialize(this);
    }

    /** @internal */
    static _containsControlChars(s: string): boolean {
        return /[\x00-\x08\x0a-\x1f\x7f]/.test(s);
    }
}
