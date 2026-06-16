import { describe, expect, test } from "bun:test";
import { DemarkusRequest } from "../../src/protocol/request/request";
import { DemarkusResponse } from "../../src/protocol/response/response";
import { DemarkusVerbs } from "../../src/protocol/verbs";
import { DemarkusStatusCodes } from "../../src/protocol/status-codes";

describe("Protocol Serialization & Parsing", () => {
    
    describe("Request", () => {
        test("serialize and parse simple request", async () => {
            const request = new DemarkusRequest({
                verb: DemarkusVerbs.FETCH,
                path: "/index.md"
            }, {
                metaData: {},
                body: ""
            });

            const serialized = request.serialize();
            expect(serialized.toString()).toContain("FETCH /index.md");

            const parsed = await DemarkusRequest.parse(serialized);
            expect(parsed.verb).toBe(DemarkusVerbs.FETCH);
            expect(parsed.path).toBe("/index.md");
        });

        test("serialize and parse request with metadata and body", async () => {
            const request = new DemarkusRequest({
                verb: DemarkusVerbs.FETCH,
                path: "/test.md"
            }, {
                metaData: { "token": "abc-123" },
                body: "Hello World"
            });

            const serialized = request.serialize();
            const parsed = await DemarkusRequest.parse(serialized);

            expect(parsed.verb).toBe(DemarkusVerbs.FETCH);
            expect(parsed.path).toBe("/test.md");
            expect(parsed.metaData["token"]).toBe("abc-123");
            expect(parsed.body).toBe("Hello World");
        });
    });

    describe("Response", () => {
        test("serialize and parse simple response", async () => {
            const response = new DemarkusResponse(DemarkusStatusCodes.OK, {}, "Content");
            
            const serialized = response.serialize();
            const parsed = await DemarkusResponse.parse(serialized);

            expect(parsed.status).toBe(DemarkusStatusCodes.OK);
            expect(parsed.body).toBe("Content");
        });

        test("serialize and parse response with metadata", async () => {
            const response = new DemarkusResponse(DemarkusStatusCodes.OK, { "content-type": "text/markdown" }, "MD Content");
            
            const serialized = response.serialize();
            const parsed = await DemarkusResponse.parse(serialized);

            expect(parsed.status).toBe(DemarkusStatusCodes.OK);
            expect(parsed.metaData["content-type"]).toBe("text/markdown");
            expect(parsed.body).toBe("MD Content");
        });
    });
});
