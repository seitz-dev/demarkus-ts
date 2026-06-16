import { IRequestParser } from "../types";
import { DemarkusRequest } from "./request";
import { DemarkusProtocolUtilities } from "../protocol";
import { DemarkusRequestHeader } from "./header";
import { DemarkusRequestPayload } from "./payload";

export class DemarkusRequestParser implements IRequestParser {
    public async parse(input: ReadableStream | Buffer | string): Promise<DemarkusRequest> {
        const data = await DemarkusProtocolUtilities.getDataFromStream(input);
        const content = data.toString('utf-8');
        const lines = content.split('\n');

        if (lines.length === 0) {
            throw new Error('Empty request');
        }

        const firstLine = lines[0];
        if (!firstLine) {
            throw new Error('Invalid request');
        }

        const header = DemarkusRequestHeader.parse(firstLine);
        const dataStartIndex = data.indexOf('\n') + 1;
        const bodyPart = data.subarray(dataStartIndex).toString('utf-8');
        const payload = DemarkusRequestPayload.parse(bodyPart);

        return new DemarkusRequest(header.opts, payload);
    }
}
