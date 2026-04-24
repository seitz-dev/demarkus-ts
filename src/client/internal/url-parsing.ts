import { DefaultPort } from "../../protocol/protocol";
import { DemarkusInvalidUrlError } from "../errors/DemarkusInvalidUrlError";

export class MarkUrl {
    host: string;
    path: string;
    port: number;

    constructor(host: string, path: string, port: number) {
        this.host = host;
        this.path = path;
        this.port = port;
    }

    toString() {
        return `mark://${this.host}:${this.port}${this.path}`;
    }
}

export function parseMarkUrl(url: string): MarkUrl {
    let urlObj: URL;

    try {
        urlObj = new URL(url);
    } catch (e) {
        throw new DemarkusInvalidUrlError('Invalid URL');
    }

    if (urlObj.protocol !== 'mark:') {
        throw new DemarkusInvalidUrlError('Invalid mark URL');
    }

    const portSpecifier = urlObj.port ? `${urlObj.port}` : `${DefaultPort}`;

    let path = urlObj.pathname;
    if (path.trim().length === 0) {
        path = '/';
    }

    return new MarkUrl(urlObj.hostname, path, parseInt(portSpecifier));
}