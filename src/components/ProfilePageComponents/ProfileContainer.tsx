import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/context';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import LoadingIndicator from '@/components/CoreComponents/LoadingIndicator';
import ProfileNftArtifactsModal from '@/components/modals/ProfileNftArtifactsModal';
import type { ProfileInventoryStory } from '@/types/types';
import ProfileNftArtifactsBanner from './ProfileNftArtifactsBanner';
import { loadMergedProfileStories } from './profileInventoryMocks';
import ProfileStorySummaryCard from './ProfileStorySummaryCard';
import ProfileUserHeader from './ProfileUserHeader';

/** Плавное появление блоков: easing ease-out. */
const profileStaggerEase = [0.22, 1, 0.36, 1] as const;

const profileStaggerChild = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: profileStaggerEase,
        },
    },
};

const ProfileContainer: React.FC = observer(() => {
    const { user } = useContext(Context) as IStoreContext;
    const { t, language } = useTranslate();
    const { hapticImpact } = useHapticFeedback();
    const [stories, setStories] = useState<ProfileInventoryStory[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [nftArtifactsModalOpen, setNftArtifactsModalOpen] = useState(false);
    const hasLoadedInventoryRef = useRef(false);
    const userId = user.user?.id;
    const prefersReducedMotion = useReducedMotion();

    const profileMainStaggerVariants = useMemo(
        () => ({
            hidden: {},
            visible: {
                transition: {
                    staggerChildren: prefersReducedMotion ? 0 : 0.058,
                    delayChildren: prefersReducedMotion ? 0 : 0.05,
                },
            },
        }),
        [prefersReducedMotion],
    );

    useEffect(() => {
        if (!userId) return;
        let cancelled = false;
        (async () => {
            if (!hasLoadedInventoryRef.current) {
                setLoading(true);
            }
            setError(null);
            try {
                const list = await loadMergedProfileStories();
                if (!cancelled) {
                    setStories(list);
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

    const headerSafeOffset = isMobile ? '158px' : '58px';

    if (loading) {
        return (
            <div className="flex flex-1 min-h-0 w-full flex-col items-center justify-center p-4" style={{ marginTop: headerSafeOffset }}>
                <LoadingIndicator />
            </div>
        );
    }

    if (error) {
        return (
            <div
                className="flex flex-1 min-h-0 w-full flex-col items-center justify-center p-4 text-center text-sm text-red-300"
                style={{ marginTop: headerSafeOffset }}
            >
                {t(error)}
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col min-h-0 w-full">
            <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto hide-scrollbar ios-scroll touch-manipulation">
                <motion.main
                    variants={profileMainStaggerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex w-full flex-col gap-8 p-4 pb-[8.5rem]"
                    style={{ marginTop: headerSafeOffset }}
                >
                    <motion.div
                        variants={profileStaggerChild}
                        className="mx-auto flex w-full max-w-2xl flex-col gap-4"
                    >
                        <ProfileUserHeader eyebrow={t('profile')} user={u} displayNickname={displayNickname} />
                        <ProfileNftArtifactsBanner
                            title={t('profileNftArtifactsBannerTitle')}
                            description={t('profileNftArtifactsBanner')}
                            onOpen={() => {
                                hapticImpact('soft');
                                setNftArtifactsModalOpen(true);
                            }}
                        />
                    </motion.div>

                    <motion.section
                        variants={profileStaggerChild}
                        aria-labelledby="profile-collections-heading"
                        className="mx-auto flex w-full max-w-2xl flex-col gap-2"
                    >
                        <div className="flex items-end justify-between gap-3 pb-1">
                            <h2 id="profile-collections-heading" className="text-sm font-semibold tracking-wide text-zinc-400">
                                {t('profileCollections')}
                            </h2>
                        </div>
                        <div className="flex flex-col gap-4">
                            {stories.map((story) => (
                                <ProfileStorySummaryCard
                                    key={story.historyName}
                                    story={story}
                                    displayTitle={storyTitle(story)}
                                    t={t}
                                />
                            ))}
                        </div>
                    </motion.section>
                </motion.main>
            </div>

            <ProfileNftArtifactsModal
                isOpen={nftArtifactsModalOpen}
                onClose={() => setNftArtifactsModalOpen(false)}
            />
        </div>
    );
});

export default ProfileContainer;
