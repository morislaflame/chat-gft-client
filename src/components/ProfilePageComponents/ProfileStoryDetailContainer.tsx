import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/context';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import LoadingIndicator from '@/components/CoreComponents/LoadingIndicator';
import ArtifactDetailModal from '@/components/modals/ArtifactDetailModal';
import type { ProfileInventoryArtifact, ProfileInventoryStory } from '@/types/types';
import ProfileStoryArtifactsSection from '@/components/ProfilePageComponents/ProfileStoryArtifactsSection';
import Button from '@/components/ui/button';
import { PROFILE_ROUTE } from '@/utils/consts';
import { loadMergedProfileStories } from '@/components/ProfilePageComponents/profileInventoryMocks';
import { motion, useReducedMotion } from 'motion/react';

const ProfileStoryDetailContainer: React.FC = observer(() => {
    const { historyName } = useParams<{ historyName: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, agent } = useContext(Context) as IStoreContext;
    const { t, language } = useTranslate();
    const { hapticImpact } = useHapticFeedback();
    const prefersReducedMotion = useReducedMotion();

    const [stories, setStories] = useState<ProfileInventoryStory[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [detailOpen, setDetailOpen] = useState(false);
    const [detailArtifact, setDetailArtifact] = useState<ProfileInventoryArtifact | null>(null);
    const [detailTitle, setDetailTitle] = useState('');
    const [detailDescription, setDetailDescription] = useState('');
    const [detailOwnedQty, setDetailOwnedQty] = useState(0);

    const userId = user.user?.id;
    const historyKey = historyName ?? '';

    useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        setLoading(true);
        setError(null);
        void (async () => {
            try {
                const list = await loadMergedProfileStories();
                if (!cancelled) setStories(list);
            } catch (e) {
                console.error(e);
                if (!cancelled) setError('profileLoadError');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [userId]);

    const story = stories?.find((s) => s.historyName === historyKey);

    useEffect(() => {
        const raw = (location.hash || '').replace(/^#/, '');
        if (!raw.startsWith('artifact-level-')) return;
        const levelSuffix = raw.slice('artifact-level-'.length).trim();
        if (!levelSuffix) return;
        const id = `profile-artifact-level-${levelSuffix}`;
        const scrollTimer = window.setTimeout(() => {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
        return () => window.clearTimeout(scrollTimer);
    }, [location.hash, story?.historyName, loading]);

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

    const handleStoryTitleOpenMissions = async () => {
        if (!story) return;
        hapticImpact('soft');
        if (agent.saving) return;
        try {
            await agent.selectHistory(story.historyName);
            user.openMissionPathFromProfile();
        } catch {
            /* selectHistory уже логирует ошибку */
        }
    };

    const isMobile =
        typeof document !== 'undefined' && document.body.classList.contains('telegram-mobile');
    const headerSafeOffset = isMobile ? '158px' : '58px';

    if (!userId || !historyName) {
        return (
            <div className="flex flex-1 min-h-0 w-full flex-col items-center p-4" style={{ marginTop: headerSafeOffset }}>
                <p className="text-center text-zinc-400">{t('profileStoryNotFound')}</p>
                <Button variant="outline" size="lg" className="mt-4" onClick={() => navigate(PROFILE_ROUTE)}>
                    {t('profileBackToProfile')}
                </Button>
            </div>
        );
    }

    if (loading) {
        return (
            <div
                className="flex flex-1 min-h-0 w-full flex-col items-center justify-center p-4"
                style={{ marginTop: headerSafeOffset }}
            >
                <LoadingIndicator />
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="flex flex-1 min-h-0 w-full flex-col items-center justify-center px-4 text-center text-sm text-red-300"
                style={{ marginTop: headerSafeOffset }}
            >
                {t(error)}
            </div>
        );
    }

    if (!story) {
        return (
            <div
                className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 p-4 text-center"
                style={{ marginTop: headerSafeOffset }}
            >
                <p className="text-zinc-400">{t('profileStoryNotFound')}</p>
                <Button
                    type="button"
                    onClick={() => {
                        hapticImpact('soft');
                        navigate(PROFILE_ROUTE);
                    }}
                    variant="outline"
                    size="icon"
                    className="w-9 h-9 shrink-0"
                    aria-label="Go back"
                    icon="fa-solid fa-chevron-left"
                />
            </div>
        ); 
    }

    return (
        <div className="flex flex-1 flex-col min-h-0 w-full">
            <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto hide-scrollbar ios-scroll touch-manipulation">
                <main
                    className="mx-auto flex w-full max-w-2xl flex-col gap-4 p-4 pb-[8.5rem]"
                    style={{ marginTop: headerSafeOffset }}
                >
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                onClick={() => {
                                    hapticImpact('soft');
                                    navigate(PROFILE_ROUTE);
                                }}
                                variant="outline"
                                size="icon"
                                className="w-9 h-9 shrink-0"
                                aria-label="Go back"
                                icon="fa-solid fa-chevron-left"
                            />
                            <p className="text-xl font-semibold tracking-tight text-white">{storyTitle(story)}</p>
                        </div>
                        <motion.button
                            type="button"
                            onClick={() => void handleStoryTitleOpenMissions()}
                            disabled={agent.saving}
                            {...(prefersReducedMotion
                                ? {}
                                : {
                                      whileTap: {
                                          scale: 0.993,
                                          transition: { duration: 0.1, ease: 'easeOut' },
                                      },
                                  })}
                            className="cursor-pointer text-sm font-medium outline-none motion-safe:transition-[color] motion-safe:duration-200 hover:text-white/95 focus-visible:ring-2 focus-visible:ring-white/25 disabled:pointer-events-none disabled:opacity-50"
                            aria-label={`${storyTitle(story)}: ${t('missionsList')}`}
                        >
                            <span className="text-sm font-medium text-user-message-gradient">{t('missionsList')}</span>
                        </motion.button>
                    </div>
                    <ProfileStoryArtifactsSection
                        story={story}
                        onOpenArtifactDetail={openArtifactDetail}
                        artifactName={artifactName}
                        t={t}
                    />
                </main>
            </div>

            <ArtifactDetailModal
                isOpen={detailOpen}
                onClose={() => setDetailOpen(false)}
                artifact={detailArtifact}
                title={detailTitle}
                description={detailDescription}
                ownedQty={detailOwnedQty}
            />
        </div>
    );
});

export default ProfileStoryDetailContainer;
