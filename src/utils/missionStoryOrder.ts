import type { Mission } from '@/types/types';

/** Порядок миссии в истории: сначала уровень, затем order внутри уровня */
export function compareMissionsByStoryOrder(a: Mission, b: Mission): number {
    const la = a.level ?? 1;
    const lb = b.level ?? 1;
    if (la !== lb) return la - lb;
    return a.orderIndex - b.orderIndex;
}
