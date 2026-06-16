import { Mutex } from "async-mutex";
import { ClientOptions } from "./client-options";
import type { DemarkusVerb } from "../protocol/verbs";
import { parseMarkUrl, type MarkUrl } from "./internal/url-parsing";
import { DemarkusRequest } from "../protocol/request/request";
import { DemarkusResponse } from "../protocol/response/response";
import { DefaultPort } from "../protocol/protocol";
import { DemarkusInvalidUrlError } from "./errors/DemarkusInvalidUrlError";
import { ITransport } from "../transport/types";
import { QuicTransport } from "../transport/quic/quic-transport";

export class DemarkusClient {
    lock: Mutex;
    options: ClientOptions;
    transport: ITransport;

    constructor(clientOptions?: Partial<ClientOptions>) {
        this.options = new ClientOptions(clientOptions);
        this.lock = new Mutex();
        this.transport = this.options.transport ?? new QuicTransport();
    }

    public async request(markUrl: MarkUrl | string, verb: DemarkusVerb, token?: string, body?: any): Promise<DemarkusResponse> {
        if (typeof markUrl === 'string') {
            markUrl = parseMarkUrl(markUrl);
        }

        if (!markUrl) throw new DemarkusInvalidUrlError('Invalid URL');

        const request = new DemarkusRequest({
            verb,
            path: markUrl.path
        }, {
            metaData: token ? { token } : {},
            body: body || ''
        });

        const targetHost = `${markUrl.host}:${markUrl.port || DefaultPort}`;
        
        return await this.lock.runExclusive(async () => {
            const connection = await this.transport.connect(targetHost);
            const requestBytes = request.serialize();
            const responseBytes = await connection.send(requestBytes);

            if (!responseBytes || responseBytes.length === 0) {
                throw new Error('No response received');
            }

            return await DemarkusResponse.parse(responseBytes);
        });
    }

    public closeAll() {
        this.transport.closeAll();
    }
}
