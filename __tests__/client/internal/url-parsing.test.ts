import {expect, test} from "bun:test";
import { parseMarkUrl } from "../../../src/client/internal/url-parsing";
import { DefaultPort } from "../../../src/protocol/protocol";

test("test url parsing", () => {
    const url = Bun.env.DEMARKUS_HUB_URL!;
    const markUrl = parseMarkUrl(url);
    
    expect(markUrl.host).toBe("hub.demarkus.io");
    expect(markUrl.port).toBe(DefaultPort);
    expect(markUrl.path).toBe("/");
});