import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { motionInteractiveSurfaceProps } from '@/components/ui/motionInteractiveSurface';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import { getStoryCollectionStats } from './profileInventoryUtils';
import type { ProfileInventoryStory } from '@/types/types';
import { buildProfileStoryPath } from '@/utils/consts';

const MotionCard = motion.create(Card);

const ARTIFACT_DECOR_SLOTS = [
    { topPct: 6, leftPct: 56, rotate: -12, scale: 1.08 },
    { topPct: 28, leftPct: 74, rotate: 17, scale: 0.88 },
    { topPct: 36, leftPct: 44, rotate: -7, scale: 0.95 },
    { topPct: 58, leftPct: 68, rotate: 21, scale: 1.02 },
    { topPct: 66, leftPct: 48, rotate: -16, scale: 0.9 },
] as const;

function fnv1aSeed(str: string): number {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619) >>> 0;
    }
    return h >>> 0;
}

function seededJitter(seed: number, idx: number, range: number): number {
    const x = Math.imul(seed + idx * 2654435761, 1103515245) >>> 0;
    const v = x % (range * 2 + 1);
    return v - range;
}

function firstArtifactMediaUrls(story: ProfileInventoryStory, max = 5): string[] {
    const out: string[] = [];
    for (const a of story.artifacts) {
        const u = a.media?.url?.trim();
        if (u) out.push(u);
        if (out.length >= max) break;
    }
    return out;
}

function formatStoryAriaSummary(
    t: (key: string) => string,
    stats: ReturnType<typeof getStoryCollectionStats>,
): string {
    return t('profileStorySummaryLine')
        .replace(/\{\{pct\}\}/g, String(stats.pctProgress))
        .replace(/\{\{owned\}\}/g, String(stats.ownedDistinctInCatalog))
        .replace(/\{\{total\}\}/g, String(stats.catalogTotal))
        .replace(/\{\{lvDone\}\}/g, String(stats.levelsFullyOwned))
        .replace(/\{\{lvAll\}\}/g, String(stats.levelsTotal));
}

export type ProfileStorySummaryCardProps = {
    story: ProfileInventoryStory;
    displayTitle: string;
    t: (key: string) => string;
};

const ProfileStorySummaryCard: React.FC<ProfileStorySummaryCardProps> = ({ story, displayTitle, t }) => {
    const navigate = useNavigate();
    const { hapticImpact } = useHapticFeedback();
    const prefersReducedMotion = useReducedMotion();

    const stats = useMemo(() => getStoryCollectionStats(story), [story]);

    const decorUrls = useMemo(() => firstArtifactMediaUrls(story, 5), [story]);

    const decorSeed = useMemo(() => fnv1aSeed(story.historyName), [story.historyName]);

    const summaryAria = formatStoryAriaSummary(t, stats);
    const to = buildProfileStoryPath(story.historyName);

    const artifactProgressLabel = `${stats.ownedDistinctInCatalog}/${stats.catalogTotal}`;
    // const levelsProgressLabel = `${stats.levelsFullyComplete}/${stats.levelsTotal}`;

    const openStory = () => {
        hapticImpact('soft');
        navigate(to);
    };

    return (
        <MotionCard
            role="link"
            tabIndex={0}
            aria-label={`${displayTitle}. ${summaryAria}. ${t('profileStoryOpenCollection')}`}
            {...(prefersReducedMotion ? {} : motionInteractiveSurfaceProps)}
            onClick={openStory}
            onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openStory();
                }
            }}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/15 bg-black/25 px-0 py-0 outline-none backdrop-blur-md motion-safe:transition-[box-shadow,filter,border-color] motion-safe:duration-400 motion-safe:ease-out hover:border-white/[0.18] hover:shadow-[0_0_24px_hsl(var(--primary)/0.22)] focus-visible:ring-2 focus-visible:ring-violet-400/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(0,0%,2%)]"
        >
            {decorUrls.length > 0 ? (
                <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                    {decorUrls.map((src, idx) => {
                        const slot = ARTIFACT_DECOR_SLOTS[idx % ARTIFACT_DECOR_SLOTS.length];
                        const jt = seededJitter(decorSeed, idx, 3);
                        const jl = seededJitter(decorSeed, idx + 11, 4);
                        const top = `${slot.topPct + jt}%`;
                        const left = `${slot.leftPct + jl}%`;

                        return (
                            <motion.div
                                key={`${story.historyName}-decor-${src}-${idx}`}
                                className="absolute origin-center"
                                initial={prefersReducedMotion ? false : { opacity: 0 }}
                                animate={{ opacity: prefersReducedMotion ? 0.36 : 0.4 }}
                                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: idx * 0.04 }}
                                style={{
                                    top,
                                    left,
                                    transform: `translate(-40%, -20%) rotate(${slot.rotate + jl * 0.4}deg) scale(${slot.scale})`,
                                }}
                            >
                                <img
                                    src={src}
                                    alt=""
                                    loading="lazy"
                                    decoding="async"
                                    draggable={false}
                                    className="pointer-events-none h-[4.25rem] w-[4.25rem] min-[380px]:h-[5rem] min-[380px]:w-[5rem] select-none object-contain [filter:drop-shadow(0_0_10px_hsl(var(--primary)_/_0.5))_drop-shadow(0_0_26px_hsl(var(--primary)_/_0.22))_drop-shadow(0_0_42px_hsl(var(--primary)_/_0.12))]"
                                />
                            </motion.div>
                        );
                    })}
                </div>
            ) : null}

            {/* Сгущаем затемнение слева, где заголовок и цифры */}
            <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-neutral-950/96 via-neutral-950/82 to-transparent"
                aria-hidden
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/35" aria-hidden />

            <div className="relative z-10 flex flex-col gap-3 px-5 py-4">
                <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="text-lg font-bold italic leading-snug tracking-tight text-white">
                            {displayTitle}
                        </div>
                    </div>
                    <i
                        className="fa-solid fa-angle-right shrink-0 text-lg text-white/85 motion-safe:transition-transform motion-safe:duration-400 motion-safe:ease-out group-hover:motion-safe:translate-x-0.5"
                        aria-hidden
                    />
                </div>

                {/* Как MissionCard: разделитель + метка секции */}
                <div className="relative z-10 flex w-full items-center px-1">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-zinc-700/55" />
                    <div className="px-3 py-0.5 text-xs text-zinc-400">{t('progress')}</div>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-zinc-700/55" />
                </div>

                <div className="flex flex-col gap-2 text-xs">
                    <div className="flex items-center justify-between gap-3">
                        <span className="min-w-0 shrink text-zinc-400">{t('artifactsInInventory')}:</span>
                        <span className="shrink-0 tabular-nums text-white font-semibold">{artifactProgressLabel}</span>
                    </div>
                    {/* <div className="flex items-center justify-between gap-3">
                        <span className="min-w-0 shrink text-zinc-400">{t('profileStoryLevelsCompleteLabel')}:</span>
                        <span className="shrink-0 tabular-nums text-artifact-gradient font-semibold">{levelsProgressLabel}</span>
                    </div> */}
                    <div className="relative mt-1 h-2 w-full overflow-hidden rounded-full border border-white/15 bg-black/45">
                        <motion.div
                            className="absolute inset-y-0 left-0 z-[1] rounded-full"
                            aria-hidden
                            initial={prefersReducedMotion ? false : { width: '0%' }}
                            animate={{ width: `${stats.pctProgress}%` }}
                            transition={{
                                duration: prefersReducedMotion ? 0 : 0.52,
                                ease: [0.22, 1, 0.36, 1],
                                delay: prefersReducedMotion ? 0 : 0.06,
                            }}
                            style={{
                                boxShadow:
                                    stats.pctProgress > 0
                                        ? '0 0 16px hsl(var(--primary) / 0.45), 0 0 8px hsl(var(--primary) / 0.3)'
                                        : undefined,
                                background: 'var(--gradient-accent-color)',
                            }}
                        />
                    </div>
                    
                </div>

            </div>
        </MotionCard>
    );
};

export default ProfileStorySummaryCard;
