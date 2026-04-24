import {expect, test} from "bun:test";
import { markQuic } from "../../../src/client/internal/native-ffi-exec";

test("ffi can load", () => {
    const response = markQuic.symbols.mark_quic_test();
    expect(response).toBe(200);
});