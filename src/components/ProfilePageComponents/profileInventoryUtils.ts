import type { ProfileInventoryArtifact, ProfileInventoryStory } from '@/types/types';

export interface ArtifactLevelGroup {
    level: number;
    artifacts: ProfileInventoryArtifact[];
    collected: number;
    total: number;
    isComplete: boolean;
}

export function isArtifactFoundInStory(found: Record<string, number>, code: string): boolean {
    return Object.prototype.hasOwnProperty.call(found, code);
}

/** Найденные в миссиях — в начале списка, внутри группы порядок по id */
export function sortArtifactsFoundFirst(
    artifacts: ProfileInventoryArtifact[],
    found: Record<string, number>,
): ProfileInventoryArtifact[] {
    return [...artifacts].sort((a, b) => {
        const foundA = isArtifactFoundInStory(found, a.code) ? 1 : 0;
        const foundB = isArtifactFoundInStory(found, b.code) ? 1 : 0;
        if (foundB !== foundA) return foundB - foundA;
        return a.id - b.id;
    });
}

export function buildLevelGroups(
    artifacts: ProfileInventoryArtifact[],
    found: Record<string, number>,
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
            const sorted = sortArtifactsFoundFirst(arts, found);
            const collected = sorted.filter((a) => isArtifactFoundInStory(found, a.code)).length;
            return {
                level,
                artifacts: sorted,
                collected,
                total: sorted.length,
                isComplete: collected === sorted.length && sorted.length > 0,
            };
        });
}

/** Совпадает с гейтом на бэке: все артефакты уровня из каталога сюжета найдены. */
export function isArtifactCatalogLevelComplete(
    story: Pick<ProfileInventoryStory, 'artifacts' | 'found'> | null | undefined,
    level: number,
): boolean {
    if (!story?.artifacts?.length) return true;
    const groups = buildLevelGroups(story.artifacts, story.found);
    const g = groups.find((x) => x.level === level);
    if (!g || g.total === 0) return true;
    return g.isComplete;
}

/** Агрегаты для компактной карточки истории на профиле. */
export function getStoryCollectionStats(
    story: Pick<ProfileInventoryStory, 'artifacts' | 'found'>,
): {
    catalogTotal: number;
    foundDistinctInCatalog: number;
    levelsTotal: number;
    levelsFullyComplete: number;
    pctCollected: number;
} {
    const groups = buildLevelGroups(story.artifacts, story.found);
    const catalogTotal = story.artifacts.length;
    const codesInCatalog = new Set(story.artifacts.map((a) => a.code));
    let foundDistinctInCatalog = 0;
    for (const code of codesInCatalog) {
        if (isArtifactFoundInStory(story.found, code)) foundDistinctInCatalog += 1;
    }
    const levelsFullyComplete = groups.filter((g) => g.isComplete).length;
    const pctCollected =
        catalogTotal > 0 ? Math.round((foundDistinctInCatalog / catalogTotal) * 100) : 0;
    return {
        catalogTotal,
        foundDistinctInCatalog,
        levelsTotal: groups.length,
        levelsFullyComplete,
        pctCollected,
    };
}
