import {expect, test} from "bun:test";
import { DemarkusClient } from "../../src/client/client";
import { DemarkusVerbs } from "../../src/protocol/verbs";
import { DemarkusStatusCodes } from "../../src/protocol/status-codes";
import { DemarkusInvalidUrlError } from "../../src/client/errors/DemarkusInvalidUrlError";

test("test FETCH /", async () => {
    const client = new DemarkusClient();    
    const response = await client.requestOnConn(Bun.env.TEST_URL!, DemarkusVerbs.FETCH);

    expect(response.status).toBe(DemarkusStatusCodes.OK);
    expect(response.body.length).toBeGreaterThan(0);
})

test("test invalid URL", async () => {
    const client = new DemarkusClient();
    await expect(client.requestOnConn("invalid-url", DemarkusVerbs.FETCH)).rejects.toThrowError(DemarkusInvalidUrlError);
});