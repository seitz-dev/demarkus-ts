import { Mutex } from "async-mutex";
import { ClientOptions } from "./client-options";
import type { DemarkusVerb } from "../protocol/verbs";
import { parseMarkUrl, type MarkUrl } from "./internal/url-parsing";
import { DemarkusRequest } from "../protocol/request/request";
import { DemarkusResponse } from "../protocol/response/response";
import { markQuic, sendRequest } from "./internal/native-ffi-exec";
import { type Pointer } from "bun:ffi";
import { DefaultPort } from "../protocol/protocol";
import { DemarkusInvalidUrlError } from "./errors/DemarkusInvalidUrlError";

export class DemarkusClient {
    lock: Mutex;
    options: ClientOptions;
    connections: Map<string, number>; // Maps URL host to the raw C-pointer of the connection

    constructor(clientOptions?: Partial<ClientOptions>) {
        this.options = new ClientOptions(clientOptions);
        this.lock = new Mutex();
        this.connections = new Map();
    }

    private getConnection(urlStr: string): number {
        if (this.connections.has(urlStr)) {
            return this.connections.get(urlStr)!;
        }

        const cStr = Buffer.from(urlStr + "\0");
        const connPtr = markQuic.symbols.connect_mark_server(cStr);

        if (connPtr === 0 || !connPtr) throw new Error(`Failed to establish QUIC connection to ${urlStr}`);

        this.connections.set(urlStr, connPtr as Pointer);
        return connPtr as number;
    }

    public async request(markUrl: MarkUrl | string, verb: DemarkusVerb, token?: string, body?: any): Promise<DemarkusResponse> {
        if (typeof markUrl === 'string') {
            markUrl = parseMarkUrl(markUrl);
        }

        if (!markUrl) throw new DemarkusInvalidUrlError('Invalid URL');

        let request = new DemarkusRequest({
            verb,
            path: markUrl.path
        }, {
            metaData: token ? { token } : {},
            body: body || ''
        });

        const targetHost = `${markUrl.host}:${markUrl.port || DefaultPort}`;
        const connPtr = this.getConnection(targetHost);

        const requestBytes = request.serialize();
        const responseBytes = sendRequest(connPtr, requestBytes);

        if (!responseBytes || responseBytes.length === 0) {
            throw new Error('No response received');
        }

        const data = await DemarkusResponse.parse(responseBytes);

        return data;
    }

    public closeAll() {
        for (const [host, ptr] of this.connections.entries()) {
            markQuic.symbols.close_mark_connection(ptr as Pointer);
        }
        this.connections.clear();
    }
}