import { ClientCache } from "./cache/client-cache";
import { ITransport } from "../transport/types";

export interface ClientOptions {
    cache: ClientCache;
    insecure: boolean;
    dialTimeout: number;
    requestTimeout: number;
    transport?: ITransport;
}

export class ClientOptions {
    constructor(options: Partial<ClientOptions> = {}) {
        this.cache = options.cache ?? new ClientCache();
        this.insecure = options.insecure ?? false;
        this.dialTimeout = options.dialTimeout ?? 10 * 1000;
        this.requestTimeout = options.requestTimeout ?? 10 * 1000;
        this.transport = options.transport;
    }
}
