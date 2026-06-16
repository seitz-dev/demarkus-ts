import { YAML } from "bun";
import { IResponseParser } from "../types";
import { DemarkusResponse } from "./response";
import { DemarkusProtocolUtilities, FrontmatterStart } from "../protocol";
import { DemarkusStatusCodes, type DemarkusStatusValue } from "../status-codes";

export class DemarkusResponseParser implements IResponseParser {
    public async parse(input: ReadableStream | Buffer | string): Promise<DemarkusResponse> {
        const data = await DemarkusProtocolUtilities.getDataFromStream(input);
        const content = data.toString('utf-8');

        const response = new DemarkusResponse(DemarkusStatusCodes.NOT_FOUND, {}, '');

        if (content.startsWith(FrontmatterStart)) {
            const endMarker = "\n---";
            const delimiterIndex = content.indexOf(endMarker, 3);

            if (delimiterIndex === -1) {
                throw new Error('Malformed response: missing closing frontmatter delimiter');
            }

            const fmContent = content.slice(3, delimiterIndex).trim();

            if (fmContent.length > 0) {
                try {
                    const parsedYaml = YAML.parse(fmContent) as Record<string, any>;

                    for (const key in parsedYaml) {
                        const value = parsedYaml[key];

                        if (key === "status") {
                            const statusStr = String(value);
                            if (Object.values(DemarkusStatusCodes).includes(statusStr as DemarkusStatusValue)) {
                                response.status = statusStr as DemarkusStatusValue;
                            } else {
                                throw new Error(`Invalid status value: ${statusStr}`);
                            }
                        }
                        else {
                            if (DemarkusProtocolUtilities.isValidMetaKey(key)) {
                                response.metaData[key] = String(value);
                            }
                        }
                    }
                } catch (e) {
                    throw new Error(`Malformed response: invalid YAML in frontmatter. ${e}`);
                }
            }

            let bodyStart = delimiterIndex + 4;
            if (content[bodyStart] === '\n') bodyStart++;
            if (content[bodyStart] === '\r') bodyStart++;
            if (content[bodyStart] === '\n') bodyStart++;

            response.body = content.substring(bodyStart);
        } else {
            response.body = content;
            response.status = DemarkusStatusCodes.OK;
        }

        return response;
    }
}
