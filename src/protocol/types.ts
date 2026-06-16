import { DemarkusRequest } from "./request/request";
import { DemarkusResponse } from "./response/response";

export interface IRequestSerializer {
    serialize(request: DemarkusRequest): Buffer;
}

export interface IRequestParser {
    parse(input: ReadableStream | Buffer | string): Promise<DemarkusRequest>;
}

export interface IResponseSerializer {
    serialize(response: DemarkusResponse): Buffer;
}

export interface IResponseParser {
    parse(input: ReadableStream | Buffer | string): Promise<DemarkusResponse>;
}
