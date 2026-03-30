import type { MissionUiStepGoals } from '@/types/types';

/** Нормализует `uiStepGoals` из API (объект или JSON-строка) в отсортированный список шагов. */
export function listMissionUiStepGoals(raw: MissionUiStepGoals | string | null | undefined): Array<{ index: number; text: string }> {
    if (raw == null) return [];
    let obj: unknown = raw;
    if (typeof raw === 'string') {
        try {
            obj = JSON.parse(raw);
        } catch {
            return [];
        }
    }
    const steps = (obj as MissionUiStepGoals)?.steps;
    if (!Array.isArray(steps)) return [];
    const out: Array<{ index: number; text: string }> = [];
    for (const s of steps) {
        if (!s || typeof s !== 'object') continue;
        const index = Number((s as { index?: unknown }).index);
        const text = String((s as { text?: unknown }).text ?? '').trim();
        if (!Number.isFinite(index) || index < 1 || !text) continue;
        out.push({ index, text });
    }
    out.sort((a, b) => a.index - b.index);
    return out;
}
