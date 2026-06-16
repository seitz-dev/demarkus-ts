import { IRequestSerializer } from "../types";
import { DemarkusRequest } from "./request";
import { FrontmatterStart, FrontmatterDelimiter } from "../protocol";

export class DemarkusRequestSerializer implements IRequestSerializer {
    public serialize(request: DemarkusRequest): Buffer {
        let output = `${request.verb} ${request.path}\n`;

        if (request.metaData && Object.keys(request.metaData).length > 0) {
            output += FrontmatterStart;
            output += Bun.YAML.stringify(request.metaData).trim();
            output += FrontmatterDelimiter;
        }

        if (request.body) {
            output += request.body;
        }

        return Buffer.from(output, 'utf-8');
    }
}
