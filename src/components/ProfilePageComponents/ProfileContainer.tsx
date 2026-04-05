import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import LoadingIndicator from '@/components/CoreComponents/LoadingIndicator';
import ArtifactDetailModal from '@/components/modals/ArtifactDetailModal';
import ArtifactsExplainerModal from '@/components/modals/ArtifactsExplainerModal';
import { getProfileInventory } from '@/http/userAPI';
import type { ProfileInventoryArtifact, ProfileInventoryStory } from '@/types/types';
import ProfileArtifactCard from './ProfileArtifactCard';

interface ArtifactLevelGroup {
    level: number;
    artifacts: ProfileInventoryArtifact[];
    collected: number;
    total: number;
    isComplete: boolean;
}

function buildLevelGroups(
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
            const collected = arts.filter((a) => (owned[a.code] ?? 0) > 0).length;
            return {
                level,
                artifacts: arts,
                collected,
                total: arts.length,
                isComplete: collected === arts.length && arts.length > 0,
            };
        });
}

interface ArtifactLevelSectionProps {
    group: ArtifactLevelGroup;
    isPrevComplete: boolean;
    hasNextLevel: boolean;
    owned: Record<string, number>;
    onOpenDetail: (art: ProfileInventoryArtifact, qty: number) => void;
    artifactName: (code: string, name: string, nameEn: string | null) => string;
    t: (key: string) => string;
}

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
            {/* Level header */}
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

            {/* Progress bar */}
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

            {/* Artifact cards */}
            <div
                className={`flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin transition-opacity duration-300 ${
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

            {/* Gate hint: show when level is complete and there is a next level */}
            {!group.isComplete && hasNextLevel && isPrevComplete && (
                <p className="text-[11px] text-zinc-500 leading-snug">
                    <i className="fa-solid fa-gem text-amber-400/70 mr-1 text-[9px]" />
                    {t('profileLevelUnlockHint').replace('{{level}}', String(group.level))}
                </p>
            )}
        </div>
    );
};

const ProfileContainer: React.FC = observer(() => {
    const { user } = useContext(Context) as IStoreContext;
    const { t, language } = useTranslate();
    const { hapticImpact } = useHapticFeedback();
    const [stories, setStories] = useState<ProfileInventoryStory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailArtifact, setDetailArtifact] = useState<ProfileInventoryArtifact | null>(null);
    const [detailTitle, setDetailTitle] = useState('');
    const [detailDescription, setDetailDescription] = useState('');
    const [detailOwnedQty, setDetailOwnedQty] = useState(0);
    const [artifactsExplainerOpen, setArtifactsExplainerOpen] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            setError(null);
            try {
                await user.fetchMyInfo();
                const data = await getProfileInventory();
                if (!cancelled) {
                    setStories(data.stories ?? []);
                }
            } catch (e) {
                console.error(e);
                if (!cancelled) {
                    setError(t('profileLoadError'));
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [user, t]);

    const isMobile = typeof document !== 'undefined' && document.body.classList.contains('telegram-mobile');
    const u = user.user;

    const displayNickname = (() => {
        if (!u) return '';
        const un = (u.username || '').trim();
        if (un) return un.startsWith('@') ? un : `@${un}`;
        const fn = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
        return fn || t('profileNoName');
    })();

    const storyTitle = (s: ProfileInventoryStory) => {
        if (language === 'en') {
            return s.displayNameEn || s.displayName || s.historyName;
        }
        return s.displayName || s.historyName;
    };

    const artifactName = (code: string, name: string, nameEn: string | null) => {
        if (language === 'en') {
            return nameEn || name || code;
        }
        return name || code;
    };

    const artifactDescription = (art: ProfileInventoryArtifact) => {
        if (language === 'en') {
            return (art.descriptionEn || art.description || '').trim();
        }
        return (art.description || art.descriptionEn || '').trim();
    };

    const openArtifactDetail = (art: ProfileInventoryArtifact, ownedQty: number) => {
        hapticImpact('soft');
        setDetailArtifact(art);
        setDetailTitle(artifactName(art.code, art.name, art.nameEn));
        setDetailDescription(artifactDescription(art));
        setDetailOwnedQty(ownedQty);
        setDetailOpen(true);
    };

    if (loading) {
        return (
            <div className="p-4 flex justify-center" style={{ marginTop: isMobile ? '158px' : '58px' }}>
                <LoadingIndicator />
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="p-4 text-center text-red-300 text-sm"
                style={{ marginTop: isMobile ? '158px' : '58px' }}
            >
                {error}
            </div>
        );
    }

    return (
        <div
            className="p-4 overflow-y-auto flex w-full flex-col gap-6 pb-28"
            style={{ marginTop: isMobile ? '158px' : '58px' }}
        >
            <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden btn-default-silver-border flex-shrink-0 bg-primary-800">
                    {u?.avatarUrl ? (
                        <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <i className="fas fa-user text-3xl text-zinc-500" />
                        </div>
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <h1 className="text-lg font-semibold text-white break-words">{displayNickname}</h1>
                    {/* {u?.balance != null && (
                        <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                            <i className="fa-solid fa-gem text-amber-400 text-[10px]" />
                            {u.balance}
                        </div>
                    )} */}
                </div>
            </div>

            <button
                type="button"
                onClick={() => {
                    hapticImpact('soft');
                    setArtifactsExplainerOpen(true);
                }}
                className="w-full text-left flex flex-col gap-3 rounded-xl border border-amber-500/35 bg-gradient-to-br from-amber-500/30 at-transparent to-transparent/50 backdrop-blur-md px-4 py-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
            >   
                <span className="text-xl text-zinc-100 leading-snug">
                    {t('profileNftArtifactsBannerTitle')}
                </span>
                <p className="text-sm text-zinc-300 leading-snug">{t('profileNftArtifactsBanner')}</p>
            </button>


            {stories.map((story) => {
                const levelGroups = buildLevelGroups(story.artifacts, story.owned);
                return (
                    <section key={story.historyName} className="flex flex-col gap-4">
                        <h3 className="text-2xl font-semibold text-white">{storyTitle(story)}</h3>
                        {story.artifacts.length === 0 ? (
                            <p className="text-xs text-zinc-500">{t('profileNoArtifactsInStory')}</p>
                        ) : (
                            levelGroups.map((group, groupIdx) => {
                                const isPrevComplete = groupIdx === 0 || levelGroups[groupIdx - 1].isComplete;
                                return (
                                    <ArtifactLevelSection
                                        key={group.level}
                                        group={group}
                                        isPrevComplete={isPrevComplete}
                                        hasNextLevel={groupIdx < levelGroups.length - 1}
                                        owned={story.owned}
                                        onOpenDetail={openArtifactDetail}
                                        artifactName={artifactName}
                                        t={t}
                                    />
                                );
                            })
                        )}
                    </section>
                );
            })}

            <ArtifactDetailModal
                isOpen={detailOpen}
                onClose={() => setDetailOpen(false)}
                artifact={detailArtifact}
                title={detailTitle}
                description={detailDescription}
                ownedQty={detailOwnedQty}
            />

            <ArtifactsExplainerModal
                isOpen={artifactsExplainerOpen}
                onClose={() => setArtifactsExplainerOpen(false)}
            />
        </div>
    );
});

export default ProfileContainer;
