import { IConnection } from "../types";
import { markQuic, sendRequest } from "../../client/internal/native-ffi-exec";
import { type Pointer } from "bun:ffi";

export class QuicConnection implements IConnection {
    constructor(private connPtr: Pointer) { }

    public async send(request: Buffer): Promise<Buffer> {
        return sendRequest(this.connPtr as any, request);
    }

    public close(): void {
        markQuic.symbols.close_mark_connection(this.connPtr);
    }
}
