import {expect, test, describe} from "bun:test";
import { parseMarkUrl } from "../../../src/client/internal/url-parsing";
import { DefaultPort } from "../../../src/protocol/protocol";
import { DemarkusInvalidUrlError } from "../../../src/client/errors/DemarkusInvalidUrlError";

describe("MarkUrl Parsing", () => {
    test("standard mark URL", () => {
        const markUrl = parseMarkUrl("mark://hub.demarkus.io");
        expect(markUrl.host).toBe("hub.demarkus.io");
        expect(markUrl.port).toBe(DefaultPort);
        expect(markUrl.path).toBe("/");
    });

    test("mark URL with port", () => {
        const markUrl = parseMarkUrl("mark://localhost:8080/test");
        expect(markUrl.host).toBe("localhost");
        expect(markUrl.port).toBe(8080);
        expect(markUrl.path).toBe("/test");
    });

    test("mark URL with deep path", () => {
        const markUrl = parseMarkUrl("mark://hub.demarkus.io/a/b/c.md");
        expect(markUrl.host).toBe("hub.demarkus.io");
        expect(markUrl.path).toBe("/a/b/c.md");
    });

    test("invalid protocol", () => {
        expect(() => parseMarkUrl("http://google.com")).toThrow(DemarkusInvalidUrlError);
    });

    test("invalid URL string", () => {
        expect(() => parseMarkUrl("not-a-url")).toThrow(DemarkusInvalidUrlError);
    });
});
