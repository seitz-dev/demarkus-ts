export const DemarkusMaxRequestLineLength = 4096; // 4 KiB
export const DemarkusMaxRequestFrontmatterLength = 1024 * 64; // 64 KiB
export const DemarkusMaxBodyLength = 1 * 1024 * 1024; // 1 MiB
export const DemarkusDelimiterLength = 64;

export const DemarkusMaxRequestLength = DemarkusMaxRequestFrontmatterLength 
    + DemarkusMaxBodyLength + DemarkusDelimiterLength;