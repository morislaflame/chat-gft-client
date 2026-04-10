import type { ProfileInventoryArtifact } from '@/types/types';

export interface ArtifactLevelGroup {
    level: number;
    artifacts: ProfileInventoryArtifact[];
    collected: number;
    total: number;
    isComplete: boolean;
}

/** Полученные (qty > 0) — в начале списка, внутри группы порядок по id */
export function sortArtifactsOwnedFirst(
    artifacts: ProfileInventoryArtifact[],
    owned: Record<string, number>,
): ProfileInventoryArtifact[] {
    return [...artifacts].sort((a, b) => {
        const ownedA = (owned[a.code] ?? 0) > 0 ? 1 : 0;
        const ownedB = (owned[b.code] ?? 0) > 0 ? 1 : 0;
        if (ownedB !== ownedA) return ownedB - ownedA;
        return a.id - b.id;
    });
}

export function buildLevelGroups(
    artifacts: ProfileInventoryArtifact[],
    owned: Record<string, number>,
): ArtifactLevelGroup[] {
    const byLevel = new Map<number, ProfileInventoryArtifact[]>();
    for (const art of artifacts) {
        const lvl = art.level ?? 1;
        if (!byLevel.has(lvl)) byLevel.set(lvl, []);
        byLevel.get(lvl)!.push(art);
    }
    return [...byLevel.entries()]
        .sort(([a], [b]) => a - b)
        .map(([level, arts]) => {
            const sorted = sortArtifactsOwnedFirst(arts, owned);
            const collected = sorted.filter((a) => (owned[a.code] ?? 0) > 0).length;
            return {
                level,
                artifacts: sorted,
                collected,
                total: sorted.length,
                isComplete: collected === sorted.length && sorted.length > 0,
            };
        });
}
