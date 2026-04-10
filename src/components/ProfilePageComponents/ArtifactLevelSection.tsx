import React from 'react';
import type { ProfileInventoryArtifact } from '@/types/types';
import ProfileArtifactCard from './ProfileArtifactCard';
import type { ArtifactLevelGroup } from './profileInventoryUtils';

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

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                        {t('profileLevel')} {group.level}
                    </span>
                    {group.isComplete && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/15 rounded-full px-1.5 py-0.5 leading-none shrink-0">
                            ✓ {t('profileLevelComplete')}
                        </span>
                    )}
                    {!isPrevComplete && (
                        <span className="text-[10px] font-bold text-zinc-500 bg-zinc-700/60 rounded-full px-1.5 py-0.5 leading-none shrink-0">
                            <i className="fa-solid fa-lock text-[9px] mr-0.5" />
                            {t('profileLevelLocked')}
                        </span>
                    )}
                </div>
                <span className="text-xs text-zinc-500 shrink-0 ml-auto">
                    {group.collected}/{group.total}
                </span>
            </div>

            <div className="relative h-1.5 rounded-full bg-zinc-800 overflow-hidden mb-2">
                <div
                    className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
                        group.isComplete
                            ? 'bg-emerald-500'
                            : isPrevComplete
                              ? 'bg-amber-500'
                              : 'bg-zinc-600'
                    }`}
                    style={{ width: `${pct}%` }}
                />
            </div>

            <div
                className={`flex gap-3 overflow-x-auto py-3 -mx-1 px-1 hide-scrollbar ios-scroll transition-opacity duration-300 ${
                    isPrevComplete ? 'opacity-100' : 'opacity-40 pointer-events-none'
                }`}
            >
                {group.artifacts.map((art) => {
                    const qty = owned[art.code] ?? 0;
                    const name = artifactName(art.code, art.name, art.nameEn);
                    return (
                        <ProfileArtifactCard
                            key={art.id}
                            artifact={art}
                            displayName={name}
                            ownedQty={qty}
                            onOpenDetail={() => onOpenDetail(art, qty)}
                        />
                    );
                })}
            </div>

            {!group.isComplete && hasNextLevel && isPrevComplete && (
                <p className="text-[11px] text-zinc-500 leading-snug">
                    <i className="fa-solid fa-gem text-amber-400/70 mr-1 text-[9px]" />
                    {t('profileLevelUnlockHint').replace('{{level}}', String(group.level))}
                </p>
            )}
        </div>
    );
};

export default ArtifactLevelSection;
