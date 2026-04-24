import { ClientCache } from "./cache/client-cache";

export interface ClientOptions {
    cache: ClientCache;
    insecure: boolean;
    dialTimeout: number;
    requestTimeout: number;
}

export class ClientOptions {
    constructor(options: Partial<ClientOptions> = {}) {
        this.cache = options.cache ?? new ClientCache();
        this.insecure = options.insecure ?? false;
        this.dialTimeout = options.dialTimeout ?? 10 * 1000;
        this.requestTimeout = options.requestTimeout ?? 10 * 1000;
    }
}