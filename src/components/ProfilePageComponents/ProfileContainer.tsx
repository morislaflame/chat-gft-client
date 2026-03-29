import React, { useContext, useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import LoadingIndicator from '@/components/CoreComponents/LoadingIndicator';
import ArtifactDetailModal from '@/components/modals/ArtifactDetailModal';
import { getProfileInventory } from '@/http/userAPI';
import type { ProfileInventoryArtifact, ProfileInventoryStory } from '@/types/types';
import ProfileArtifactCard from './ProfileArtifactCard';

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
                    {u?.balance != null && (
                        <div className="text-xs text-zinc-400 mt-1 flex items-center gap-1">
                            <i className="fa-solid fa-gem text-amber-400 text-[10px]" />
                            {u.balance}
                        </div>
                    )}
                </div>
            </div>

            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wide">{t('profileCollections')}</h2>

            {stories.map((story) => (
                <section key={story.historyName} className="flex flex-col gap-2">
                    <h3 className="text-base font-semibold text-white">{storyTitle(story)} Level 1</h3>
                    {story.artifacts.length === 0 ? (
                        <p className="text-xs text-zinc-500">{t('profileNoArtifactsInStory')}</p>
                    ) : (
                        <div className="flex gap-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
                            {story.artifacts.map((art) => {
                                const qty = story.owned[art.code] ?? 0;
                                const name = artifactName(art.code, art.name, art.nameEn);
                                return (
                                    <ProfileArtifactCard
                                        key={art.id}
                                        artifact={art}
                                        displayName={name}
                                        ownedQty={qty}
                                        onOpenDetail={() => openArtifactDetail(art, qty)}
                                    />
                                );
                            })}
                        </div>
                    )}
                </section>
            ))}

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

export default ProfileContainer;
