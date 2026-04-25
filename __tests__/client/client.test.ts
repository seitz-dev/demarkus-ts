import { describe, expect, test } from "bun:test";
import { DemarkusClient } from "../../src/client/client";
import { DemarkusVerbs } from "../../src/protocol/verbs";
import { DemarkusStatusCodes } from "../../src/protocol/status-codes";
import { DemarkusInvalidUrlError } from "../../src/client/errors/DemarkusInvalidUrlError";


describe("DemarkusClient", () => {

    describe("FETCH", () => {

        test("/ (Demarkus Hub Root)", async () => {
            const client = new DemarkusClient();
            const response = await client.request(Bun.env.DEMARKUS_HUB_URL!, DemarkusVerbs.FETCH);

            expect(response.status).toBe(DemarkusStatusCodes.OK);
            expect(response.body.length).toBeGreaterThan(0);
        })

        test("/tools.md", async () => {
            const client = new DemarkusClient();
            const response = await client.request(Bun.env.DEMARKUS_HUB_URL! + "/tools.md", DemarkusVerbs.FETCH);

            expect(response.status).toBe(DemarkusStatusCodes.OK);
            expect(response.body.length).toBeGreaterThan(0);
        })


        test("/nonexistent (Not Found Expected)", async () => {
            const client = new DemarkusClient();
            const response = await client.request(Bun.env.DEMARKUS_HUB_URL! + "/nonexistent", DemarkusVerbs.FETCH);

            expect(response.status).toBe(DemarkusStatusCodes.NOT_FOUND);
        });


        test("/index.md/v1", async () => {
            const client = new DemarkusClient();
            const response = await client.request(Bun.env.DEMARKUS_HUB_URL! + "/index.md/v1", DemarkusVerbs.FETCH);

            expect(response.status).toBe(DemarkusStatusCodes.OK);
            expect(response.body.length).toBeGreaterThan(0);
        });

        test("invalid URL (Invalid URL Error Expected)", async () => {
            const client = new DemarkusClient();
            expect(client.request("invalid-url", DemarkusVerbs.FETCH)).rejects.toThrowError(DemarkusInvalidUrlError);
        });

    });

    describe("VERSION", () => {
        test("/ (Demarkus Hub Root)", async () => {
            const client = new DemarkusClient();
            const response = await client.request(Bun.env.DEMARKUS_HUB_URL! + "/index.md", DemarkusVerbs.VERSIONS);

            expect(response.status).toBe(DemarkusStatusCodes.OK);

            expect(response.body.length).toBeGreaterThan(0);
        });
    })

    describe("LIST", () => {
        test("/ (Demarkus Hub Root)", async () => {
            const client = new DemarkusClient();
            const response = await client.request(Bun.env.DEMARKUS_HUB_URL! + "/index.md", DemarkusVerbs.LIST);
        
            expect(response.status).toBe(DemarkusStatusCodes.OK);
            console.log("List Response Body:", response.body);
            expect(response.body.length).toBeGreaterThan(0);
        });
    })
});