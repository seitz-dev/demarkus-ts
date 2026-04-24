import { dlopen, FFIType, suffix, ptr as toPtr } from "bun:ffi";
import { join } from "path";

const libPath = join(
    import.meta.dir, "native", "target", "release",
    process.platform === "win32" ? `native.${suffix}` : `libnative.${suffix}`
);

export const markQuic = dlopen(libPath, {
    mark_quic_test: {
        args: [],
        returns: FFIType.i32,
    },
    connect_mark_server: {
        args: [FFIType.cstring],
        returns: FFIType.ptr,
    },
    send_mark_request: {
        args: [
            FFIType.ptr, // state
            FFIType.ptr, // payload
            FFIType.i32, // payload_len
            FFIType.ptr, // out_buf_ptr
            FFIType.i32, // out_buf_len
            FFIType.ptr  // actual_len_ptr
        ],
        returns: FFIType.i32,
    },
    free_response_buffer: {
        args: [FFIType.ptr, FFIType.i32],
        returns: FFIType.void,
    },
    close_mark_connection: {
        args: [FFIType.ptr],
        returns: FFIType.void,
    },
});

export function sendRequest(connPtr: number, payload: Uint8Array): Buffer {
    const jsBuffer = new Uint8Array(64 * 1024);
    const actualLenArray = new BigUint64Array(1);

    const status = markQuic.symbols.send_mark_request(
        connPtr,
        toPtr(payload),
        payload.length,
        toPtr(jsBuffer),
        jsBuffer.length,
        toPtr(actualLenArray)
    );

    if (status === -3) throw new Error("Response exceeded 64KB buffer");
    if (status !== 0) throw new Error(`Native QUIC Error: ${status}`);

    const finalLen = Number(actualLenArray[0]);
    return Buffer.from(jsBuffer.subarray(0, finalLen));
}