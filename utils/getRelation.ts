export function getRelation<T>(relation: T | T[] | null | undefined): T | undefined {
    if (!relation) return undefined;
    return Array.isArray(relation) ? relation[0] : relation;
}
