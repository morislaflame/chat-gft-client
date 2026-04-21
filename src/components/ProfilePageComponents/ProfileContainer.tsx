import React, { useContext, useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import LoadingIndicator from '@/components/CoreComponents/LoadingIndicator';
import ArtifactDetailModal from '@/components/modals/ArtifactDetailModal';
import ArtifactsExplainerModal from '@/components/modals/ArtifactsExplainerModal';
import { getProfileInventory } from '@/http/userAPI';
import type { ProfileInventoryArtifact, ProfileInventoryStory } from '@/types/types';
import ProfileNftArtifactsBanner from './ProfileNftArtifactsBanner';
import ProfileStoryArtifactsSection from './ProfileStoryArtifactsSection';
import ProfileUserHeader from './ProfileUserHeader';

const ProfileContainer: React.FC = observer(() => {
    const { user, agent } = useContext(Context) as IStoreContext;
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
    const hasLoadedInventoryRef = useRef(false);
    const userId = user.user?.id;

    useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        (async () => {
            if (!hasLoadedInventoryRef.current) {
                setLoading(true);
            }
            setError(null);
            try {
                const data = await getProfileInventory();
                if (!cancelled) {
                    setStories(data.stories ?? []);
                    hasLoadedInventoryRef.current = true;
                }
            } catch (e) {
                console.error(e);
                if (!cancelled) {
                    setError('profileLoadError');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [userId]);

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

    const handleStoryTitleOpenMissions = async (historyName: string) => {
        hapticImpact('soft');
        if (agent.saving) return;
        try {
            await agent.selectHistory(historyName);
            user.openMissionPathFromProfile();
        } catch {
            /* selectHistory уже логирует ошибку */
        }
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
                {t(error)}
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-0 w-full overflow-y-auto overflow-x-hidden hide-scrollbar ios-scroll">
            <div
                className="flex-1 min-h-0  p-4 flex w-full flex-col gap-6 pb-32"
                style={{ marginTop: isMobile ? '158px' : '58px' }}
            >
                <ProfileUserHeader user={u} displayNickname={displayNickname} />

                <ProfileNftArtifactsBanner
                    title={t('profileNftArtifactsBannerTitle')}
                    description={t('profileNftArtifactsBanner')}
                    onOpen={() => {
                        hapticImpact('soft');
                        setArtifactsExplainerOpen(true);
                    }}
                />

                {stories.map((story) => (
                    <ProfileStoryArtifactsSection
                        key={story.historyName}
                        story={story}
                        displayTitle={storyTitle(story)}
                        missionsDisabled={agent.saving}
                        onOpenMissions={() => void handleStoryTitleOpenMissions(story.historyName)}
                        onOpenArtifactDetail={openArtifactDetail}
                        artifactName={artifactName}
                        t={t}
                    />
                ))}
            </div>

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
