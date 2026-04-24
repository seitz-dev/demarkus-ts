export const DemarkusStatusCodes = {
    OK: "ok",
    CREATED: "created",
    NOT_MODIFIED: "not_modified",
    NOT_FOUND: "not-found",
    ARCHIVED: "archived",
    UNAUTHORIZED: "unauthorized",
    NOT_PERMITTED: "not-permitted",
    CONFLICT: "conflict",
    BAD_REQUEST: "bad-request",
    SERVER_ERROR: "server-error",
} as const;

export type DemarkusStatusCode = keyof typeof DemarkusStatusCodes;
export type DemarkusStatusValue = (typeof DemarkusStatusCodes)[DemarkusStatusCode];