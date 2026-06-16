import { ITransport, IConnection } from "../../src/transport/types";

export class MockConnection implements IConnection {
    constructor(public onSend: (request: Buffer) => Promise<Buffer>) {}

    async send(request: Buffer): Promise<Buffer> {
        return this.onSend(request);
    }

    close(): void {}
}

export class MockTransport implements ITransport {
    private connections: Map<string, MockConnection> = new Map();

    constructor(private responseFactory: (url: string, request: Buffer) => Promise<Buffer>) {}

    async connect(url: string): Promise<IConnection> {
        if (!this.connections.has(url)) {
            this.connections.set(url, new MockConnection(async (req) => this.responseFactory(url, req)));
        }
        return this.connections.get(url)!;
    }

    closeAll(): void {
        this.connections.clear();
    }
}
