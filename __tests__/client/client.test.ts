import { describe, expect, test } from "bun:test";
import { DemarkusClient } from "../../src/client/client";
import { DemarkusVerbs } from "../../src/protocol/verbs";
import { DemarkusStatusCodes } from "../../src/protocol/status-codes";
import { DemarkusInvalidUrlError } from "../../src/client/errors/DemarkusInvalidUrlError";
import { MockTransport } from "./mock-transport";
import { DemarkusResponse } from "../../src/protocol/response/response";


describe("DemarkusClient Unit Tests", () => {

    test("successful request with mock transport", async () => {
        const mockTransport = new MockTransport(async (url, req) => {
            const response = new DemarkusResponse(DemarkusStatusCodes.OK, { "server": "mock" }, "Mock Body");
            return response.serialize();
        });

        const client = new DemarkusClient({ transport: mockTransport });
        const response = await client.request("mark://test.com/index.md", DemarkusVerbs.FETCH);

        expect(response.status).toBe(DemarkusStatusCodes.OK);
        expect(response.body).toBe("Mock Body");
        expect(response.metaData["server"]).toBe("mock");
    });

    test("failed request with mock transport (404)", async () => {
        const mockTransport = new MockTransport(async (url, req) => {
            const response = new DemarkusResponse(DemarkusStatusCodes.NOT_FOUND, {}, "Not Found");
            return response.serialize();
        });

        const client = new DemarkusClient({ transport: mockTransport });
        const response = await client.request("mark://test.com/404", DemarkusVerbs.FETCH);

        expect(response.status).toBe(DemarkusStatusCodes.NOT_FOUND);
    });

    test("invalid URL", async () => {
        const client = new DemarkusClient();
        expect(client.request("invalid-url", DemarkusVerbs.FETCH)).rejects.toThrow(DemarkusInvalidUrlError);
    });
});

describe("DemarkusClient Integration Tests (Requires Native FFI & Hub)", () => {
    // Only run if DEMARKUS_HUB_URL is set
    const hubUrl = Bun.env.DEMARKUS_HUB_URL;
    
    if (hubUrl) {
        describe("FETCH", () => {

            test("/ (Demarkus Hub Root)", async () => {
                const client = new DemarkusClient();
                const response = await client.request(hubUrl, DemarkusVerbs.FETCH);

                expect(response.status).toBe(DemarkusStatusCodes.OK);
                expect(response.body.length).toBeGreaterThan(0);
            })

            test("/tools.md", async () => {
                const client = new DemarkusClient();
                const response = await client.request(hubUrl + "/tools.md", DemarkusVerbs.FETCH);

                expect(response.status).toBe(DemarkusStatusCodes.OK);
                expect(response.body.length).toBeGreaterThan(0);
            })


            test("/nonexistent (Not Found Expected)", async () => {
                const client = new DemarkusClient();
                const response = await client.request(hubUrl + "/nonexistent", DemarkusVerbs.FETCH);

                expect(response.status).toBe(DemarkusStatusCodes.NOT_FOUND);
            });
        });

        describe("VERSION", () => {
            test("/ (Demarkus Hub Root)", async () => {
                const client = new DemarkusClient();
                const response = await client.request(hubUrl + "/index.md", DemarkusVerbs.VERSIONS);

                expect(response.status).toBe(DemarkusStatusCodes.OK);
                expect(response.body.length).toBeGreaterThan(0);
            });
        })

        describe("LIST", () => {
            test("/ (Demarkus Hub Root)", async () => {
                const client = new DemarkusClient();
                const response = await client.request(hubUrl + "/", DemarkusVerbs.LIST);

                if (response.status !== DemarkusStatusCodes.OK) {
                    console.log(`LIST / failed with status: ${response.status}, body: ${response.body}`);
                }
                expect(response.status).toBe(DemarkusStatusCodes.OK);
                expect(response.body.length).toBeGreaterThan(0);
            });
        })
    } else {
        test.skip("Integration tests skipped: DEMARKUS_HUB_URL not set", () => {});
    }
});
