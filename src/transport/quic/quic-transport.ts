import { ITransport, IConnection } from "../types";
import { QuicConnection } from "./quic-connection";
import { markQuic } from "../../client/internal/native-ffi-exec";
import { type Pointer } from "bun:ffi";

export class QuicTransport implements ITransport {
    private connections: Map<string, IConnection> = new Map();

    public async connect(url: string): Promise<IConnection> {
        if (this.connections.has(url)) {
            return this.connections.get(url)!;
        }

        const cStr = Buffer.from(url + "\0");
        const connPtr = markQuic.symbols.connect_mark_server(cStr);

        if (connPtr === 0 || !connPtr) {
            throw new Error(`Failed to establish QUIC connection to ${url}`);
        }

        const connection = new QuicConnection(connPtr as Pointer);
        this.connections.set(url, connection);
        return connection;
    }

    public closeAll(): void {
        for (const conn of this.connections.values()) {
            conn.close();
        }
        this.connections.clear();
    }
}
