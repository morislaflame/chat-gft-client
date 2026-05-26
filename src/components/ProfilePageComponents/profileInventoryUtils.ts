import type { ProfileInventoryArtifact, ProfileInventoryStory } from '@/types/types';

export interface ArtifactLevelGroup {
    level: number;
    artifacts: ProfileInventoryArtifact[];
    collected: number;
    total: number;
    isComplete: boolean;
}

export function isArtifactOwned(owned: Record<string, number>, code: string): boolean {
    return (owned[code] ?? 0) > 0;
}

/** В инвентаре — в начале списка, внутри группы порядок по id */
export function sortArtifactsOwnedFirst(
    artifacts: ProfileInventoryArtifact[],
    owned: Record<string, number>,
): ProfileInventoryArtifact[] {
    return [...artifacts].sort((a, b) => {
        const ownedA = isArtifactOwned(owned, a.code) ? 1 : 0;
        const ownedB = isArtifactOwned(owned, b.code) ? 1 : 0;
        if (ownedB !== ownedA) return ownedB - ownedA;
        return a.id - b.id;
    });
}

export function buildLevelGroups(
    artifacts: ProfileInventoryArtifact[],
    owned: Record<string, number>,
    unlockedLevels?: number[],
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
            const collected = sorted.filter((a) => isArtifactOwned(owned, a.code)).length;
            return {
                level,
                artifacts: sorted,
                collected,
                total: sorted.length,
                isComplete: isProfileLevelStoryComplete(level, unlockedLevels),
            };
        });
}

export function isStoryLevelUnlocked(
    unlockedLevels: number[] | undefined,
    level: number,
): boolean {
    if (level <= 1) return true;
    return (unlockedLevels ?? [1]).includes(level);
}

/** Уровень артефактов «завершён» в профиле, когда открыт следующий уровень сюжета. */
export function isProfileLevelStoryComplete(
    level: number,
    unlockedLevels: number[] | undefined,
): boolean {
    return isStoryLevelUnlocked(unlockedLevels, level + 1);
}

/** Уровень пройден в сюжете (открыт следующий уровень). */
export function isArtifactCatalogLevelOwned(
    story:
        | Pick<ProfileInventoryStory, 'artifacts' | 'owned'> & {
              unlockedLevels?: number[];
          }
        | null
        | undefined,
    level: number,
): boolean {
    if (!story?.artifacts?.length) return true;
    return isProfileLevelStoryComplete(level, story.unlockedLevels);
}

/** Агрегаты для компактной карточки истории на профиле. */
export function getStoryCollectionStats(
    story: Pick<ProfileInventoryStory, 'artifacts' | 'owned' | 'unlockedLevels'>,
): {
    catalogTotal: number;
    ownedDistinctInCatalog: number;
    levelsTotal: number;
    levelsFullyOwned: number;
    /** Доля артефактов в каталоге (без учёта открытых уровней). */
    pctCollected: number;
    /** Прогресс для полоски: завершённые уровни = 100%, иначе по артефактам уровня. */
    pctProgress: number;
} {
    const groups = buildLevelGroups(story.artifacts, story.owned, story.unlockedLevels);
    const catalogTotal = story.artifacts.length;
    const codesInCatalog = new Set(story.artifacts.map((a) => a.code));
    let ownedDistinctInCatalog = 0;
    for (const code of codesInCatalog) {
        if (isArtifactOwned(story.owned, code)) ownedDistinctInCatalog += 1;
    }
    const levelsFullyOwned = groups.filter((g) => g.isComplete).length;
    const pctCollected =
        catalogTotal > 0 ? Math.round((ownedDistinctInCatalog / catalogTotal) * 100) : 0;
    let effectiveCollected = 0;
    for (const g of groups) {
        effectiveCollected += g.isComplete ? g.total : g.collected;
    }
    const pctProgress =
        catalogTotal > 0 ? Math.round((effectiveCollected / catalogTotal) * 100) : 0;
    return {
        catalogTotal,
        ownedDistinctInCatalog,
        levelsTotal: groups.length,
        levelsFullyOwned,
        pctCollected,
        pctProgress,
    };
}

/** @deprecated используйте isArtifactOwned */
export function isArtifactFoundInStory(_found: Record<string, number>, code: string): boolean {
    void _found;
    void code;
    return false;
}

/** @deprecated используйте isArtifactCatalogLevelOwned */
export function isArtifactCatalogLevelComplete(
    story: Pick<ProfileInventoryStory, 'artifacts' | 'found' | 'owned' | 'unlockedLevels'> | null | undefined,
    level: number,
): boolean {
    if (!story) return true;
    return isArtifactCatalogLevelOwned(story, level);
}
