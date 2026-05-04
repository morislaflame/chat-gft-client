import type { ProfileInventoryArtifact, ProfileInventoryStory } from '@/types/types';

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
        const ownedA = Object.prototype.hasOwnProperty.call(owned, a.code) ? 1 : 0;
        const ownedB = Object.prototype.hasOwnProperty.call(owned, b.code) ? 1 : 0;
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
            const collected = sorted.filter((a) => Object.prototype.hasOwnProperty.call(owned, a.code)).length;
            return {
                level,
                artifacts: sorted,
                collected,
                total: sorted.length,
                isComplete: collected === sorted.length && sorted.length > 0,
            };
        });
}

/** Агрегаты для компактной карточки истории на профиле. */
export function getStoryCollectionStats(
    story: Pick<ProfileInventoryStory, 'artifacts' | 'owned'>,
): {
    catalogTotal: number;
    ownedDistinctInCatalog: number;
    levelsTotal: number;
    levelsFullyComplete: number;
    pctCollected: number;
} {
    const groups = buildLevelGroups(story.artifacts, story.owned);
    const catalogTotal = story.artifacts.length;
    const codesInCatalog = new Set(story.artifacts.map((a) => a.code));
    let ownedDistinctInCatalog = 0;
    for (const code of codesInCatalog) {
        if (Object.prototype.hasOwnProperty.call(story.owned, code)) ownedDistinctInCatalog += 1;
    }
    const levelsFullyComplete = groups.filter((g) => g.isComplete).length;
    const pctCollected =
        catalogTotal > 0 ? Math.round((ownedDistinctInCatalog / catalogTotal) * 100) : 0;
    return {
        catalogTotal,
        ownedDistinctInCatalog,
        levelsTotal: groups.length,
        levelsFullyComplete,
        pctCollected,
    };
}
