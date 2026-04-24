import { DemarkusRequest } from "./request";
import { DemarkusMaxRequestLineLength } from "./consts";
import { DemarkusVerbs, type DemarkusVerb } from "../verbs";

export interface DemarkusRequestHeaderOpts {
    verb: DemarkusVerb;
    path: string;
}

export class DemarkusRequestHeader {
    constructor(public opts: DemarkusRequestHeaderOpts) { }

    public static parse(header: string): DemarkusRequestHeader {
        if(header.length > DemarkusMaxRequestLineLength){
            throw new Error(`Request line exceeds limit: ${header.length} > ${DemarkusMaxRequestLineLength}`);
        }
        
        const [verb, path] = header.split(' ');

        if (!verb || !path) {
            throw new Error('Invalid request header format');
        }

        if (verb.trim().length === 0) {
            throw new Error('Verb cannot be empty');
        }

        if (path.trim().length === 0) {
            throw new Error('Path cannot be empty');
        }

        if (!path.startsWith('/')) {
            throw new Error('Path must start with a slash (/)');
        }

        if (!DemarkusVerbs[verb as DemarkusVerb]) {
            throw new Error(`Unknown verb: ${verb}`);
        }

        if(DemarkusRequest._containsControlChars(path)){
            throw new Error('Path contains control characters');
        }

        return new DemarkusRequestHeader({ verb: verb as DemarkusVerb, path });
    }

    public serialize(): string {
        return `${this.opts.verb} ${this.opts.path}`;
    }
}