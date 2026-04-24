export type DemarkusVerb = 
    'FETCH' | 'LIST' |
    'VERSIONS' | 'PUBLISH' |
    'APPEND' | 'ARCHIVE';

export const DemarkusVerbs: Record<DemarkusVerb, DemarkusVerb> = {
    FETCH: 'FETCH',
    LIST: 'LIST',
    VERSIONS: 'VERSIONS',
    PUBLISH: 'PUBLISH',
    APPEND: 'APPEND',
    ARCHIVE: 'ARCHIVE',
}
    