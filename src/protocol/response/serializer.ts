import { IResponseSerializer } from "../types";
import { DemarkusResponse } from "./response";
import { DemarkusProtocolUtilities } from "../protocol";

export class DemarkusResponseSerializer implements IResponseSerializer {
    public serialize(response: DemarkusResponse): Buffer {
        let output = `---\nstatus: ${response.status}\n`;

        for (const key in response.metaData) {
            if (response.metaData[key] && typeof response.metaData[key] === 'string' && DemarkusProtocolUtilities.isValidMetaValue(response.metaData[key])) {
                output += `${key}: ${response.metaData[key]}\n`;
            }
        }
        output += `---\n${response.body}`;

        return Buffer.from(output, 'utf-8');
    }
}
