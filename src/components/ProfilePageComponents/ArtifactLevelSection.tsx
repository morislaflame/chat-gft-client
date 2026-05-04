import React from 'react';
import type { ProfileInventoryArtifact } from '@/types/types';
import ProfileArtifactCard from './ProfileArtifactCard';
import type { ArtifactLevelGroup } from './profileInventoryUtils';
import { motion, useReducedMotion } from 'motion/react';

export type ArtifactLevelSectionProps = {
    group: ArtifactLevelGroup;
    isPrevComplete: boolean;
    hasNextLevel: boolean;
    owned: Record<string, number>;
    onOpenDetail: (art: ProfileInventoryArtifact, qty: number) => void;
    artifactName: (code: string, name: string, nameEn: string | null) => string;
    t: (key: string) => string;
};

const ArtifactLevelSection: React.FC<ArtifactLevelSectionProps> = ({
    group,
    isPrevComplete,
    hasNextLevel,
    owned,
    onOpenDetail,
    artifactName,
    t,
}) => {
    const pct = group.total > 0 ? Math.round((group.collected / group.total) * 100) : 0;

    const prefersReducedMotion = useReducedMotion();

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm font-bold text-white uppercase tracking-wide">
                        {t('profileLevel')} {group.level}
                    </span>
                    {group.isComplete && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/15 rounded-full px-1.5 py-0.5 leading-none shrink-0">
                            ✓ {t('profileLevelComplete')}
                        </span>
                    )}
                    {!isPrevComplete && (
                        <span className="text-[10px] font-bold text-zinc-400 bg-zinc-700/60 rounded-full px-1.5 py-0.5 leading-none shrink-0">
                            <i className="fa-solid fa-lock text-[9px] mr-0.5" />
                            {t('profileLevelLocked')}
                        </span>
                    )}
                </div>
                <span className="text-xs text-zinc-500 shrink-0 ml-auto">
                    {t('artifactsFound')}: {group.collected}/{group.total}
                </span>
            </div>

            <div className="relative mt-1 h-2 w-full overflow-hidden rounded-full border border-white/15 bg-black/45">
                        <motion.div
                            className="absolute inset-y-0 left-0 z-[1] rounded-full"
                            aria-hidden
                            initial={prefersReducedMotion ? false : { width: '0%' }}
                            animate={{ width: `${pct}%` }}
                            transition={{
                                duration: prefersReducedMotion ? 0 : 0.52,
                                ease: [0.22, 1, 0.36, 1],
                                delay: prefersReducedMotion ? 0 : 0.06,
                            }}
                            style={{
                                boxShadow:
                                    pct > 0
                                        ? '0 0 16px hsl(var(--primary) / 0.45), 0 0 8px hsl(var(--primary) / 0.3)'
                                        : undefined,
                                background: 'var(--gradient-accent-color)',
                            }}
                        />
                    </div>


            <div
                className={`flex gap-3 overflow-x-auto py-3 -mx-1 px-1 hide-scrollbar ios-scroll transition-opacity duration-300 ${
                    isPrevComplete ? 'opacity-100' : 'opacity-40 pointer-events-none'
                }`}
            >
                {group.artifacts.map((art) => {
                    const qty = owned[art.code] ?? 0;
                    const isFound = Object.prototype.hasOwnProperty.call(owned, art.code);
                    const name = artifactName(art.code, art.name, art.nameEn);
                    return (
                        <ProfileArtifactCard
                            key={art.id}
                            artifact={art}
                            displayName={name}
                            ownedQty={qty}
                            isFound={isFound}
                            onOpenDetail={() => onOpenDetail(art, qty)}
                        />
                    );
                })}
            </div>

            {!group.isComplete && hasNextLevel && isPrevComplete && (
                <motion.span
                className=""
            >
                <i className="fa-solid fa-gem text-artifact-gradient mr-2 text-[12px]" />
                <p className="text-sm inline text-zinc-400">{t('profileLevelUnlockHint').replace('{{level}}', String(group.level))}</p>
                </motion.span>
            )}
        </div>
    );
};

export default ArtifactLevelSection;
