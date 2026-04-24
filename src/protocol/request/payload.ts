import { YAML } from "bun";
import { DemarkusMaxBodyLength, DemarkusMaxRequestFrontmatterLength } from "./consts";
import { FrontmatterDelimiter, FrontmatterStart } from "../protocol";

export interface DemarkusRequestPayloadOpts {
    metaData: Record<string, string>;
    body: string;
}

export class DemarkusRequestPayload {
    public metaData: Record<string, string>;
    public body: string;

    constructor(opts?: Partial<DemarkusRequestPayloadOpts>) {
        this.metaData = opts?.metaData || {};
        this.body = opts?.body || '';
    }

    static parse(input: string): DemarkusRequestPayload {
        const payload = new DemarkusRequestPayload();

        if (input.startsWith(FrontmatterStart)) {
            const rest = input.substring(FrontmatterStart.length);
            const delimiterIndex = rest.indexOf(FrontmatterDelimiter, 4);

            if (delimiterIndex === -1) {
                // check for closing --- at the very end
                if (rest.endsWith('\n---')) {
                    const fmContent = rest.slice(4, -3);
                    payload.metaData = YAML.parse(fmContent) as Record<string, string>;
                } else {
                    throw new Error('Malformed request payload: missing frontmatter delimiter');
                }
            } else {
                const fmContent = rest.slice(4, delimiterIndex);
                if (Buffer.byteLength(fmContent, 'utf-8') > DemarkusMaxRequestFrontmatterLength) {
                    throw new Error('Request payload frontmatter exceeds maximum length');
                }
                payload.metaData = YAML.parse(fmContent) as Record<string, string>;
                const bodyPart = rest.substring(delimiterIndex + FrontmatterDelimiter.length);

                if (bodyPart.length > DemarkusMaxBodyLength) {
                    throw new Error('Request payload body exceeds maximum length');
                }
                payload.body = bodyPart.toString();
            }
        } else {
            if (input.length > DemarkusMaxBodyLength) {
                throw new Error('Request payload body exceeds maximum length');
            }
            payload.body = input;
        }

        return payload;
    }

    public serialize(): string {
        let output = '';
        if (Object.keys(this.metaData).length > 0) {
            output += `${FrontmatterStart}${YAML.stringify(this.metaData)}${FrontmatterDelimiter}`;
        }
        if (this.body) {
            output += this.body;
        }
        return output;
    }
}