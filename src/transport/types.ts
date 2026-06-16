import { DemarkusResponse } from "../protocol/response/response";
import { DemarkusRequest } from "../protocol/request/request";

export interface IConnection {
    send(request: Buffer): Promise<Buffer>;
    close(): void;
}

export interface ITransport {
    connect(url: string): Promise<IConnection>;
    closeAll(): void;
}
