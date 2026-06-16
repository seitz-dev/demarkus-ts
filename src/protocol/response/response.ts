import { DemarkusStatusCodes, type DemarkusStatusValue } from "../status-codes";
import { DemarkusResponseSerializer } from "./serializer";
import { DemarkusResponseParser } from "./parser";

export interface DemarkusResponse {
    status: DemarkusStatusValue;
    metaData: Record<string, string>;
    body: string;
}

export class DemarkusResponse {
    constructor(public status: DemarkusStatusValue, public metaData: Record<string, string>, public body: string) { }

    public static async parse(input: ReadableStream | Buffer | string): Promise<DemarkusResponse> {
        return new DemarkusResponseParser().parse(input);
    }

    public serialize(): Buffer {
        return new DemarkusResponseSerializer().serialize(this);
    }
}
