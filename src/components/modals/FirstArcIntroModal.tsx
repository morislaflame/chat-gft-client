import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/context';
import { useTranslate } from '@/utils/useTranslate';
import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import { LoadingIndicatorContent } from '@/components/CoreComponents/LoadingIndicator';
import { LazyMediaRenderer } from '@/utils/lazy-media-renderer';
import { useAnimationLoader } from '@/utils/useAnimationLoader';
import type { CaseBox } from '@/http/caseAPI';
import type { Reward } from '@/http/rewardAPI';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import { trackEvent } from '@/utils/analytics';

export const FIRST_ARC_GEMS = 100;

const sortedCasesByPrice = (items: CaseBox[]): CaseBox[] =>
    [...items].sort((a, b) => a.price - b.price);

const FirstArcIntroModal: React.FC = observer(() => {
    const { user, reward, cases, chat } = useContext(Context) as IStoreContext;
    const { t, language } = useTranslate();
    const { hapticImpact, hapticNotification } = useHapticFeedback();
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [rewardsFetchPending, setRewardsFetchPending] = useState(false);
    const [casesFetchPending, setCasesFetchPending] = useState(false);
    const sliderRef = useRef<HTMLDivElement>(null);
    const playClickedRef = useRef(false);

    const isOpen = user.showFirstArcIntroModal;

    useEffect(() => {
        if (isOpen) {
            trackEvent('first_arc_intro_shown', { gems: FIRST_ARC_GEMS });
            setActiveSlideIndex(0);
            playClickedRef.current = false;
            if (sliderRef.current) {
                sliderRef.current.scrollLeft = 0;
            }
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setRewardsFetchPending(false);
            setCasesFetchPending(false);
            return;
        }

        let cancelled = false;

        if (reward.hasLoadedAvailableRewards) {
            setRewardsFetchPending(false);
        } else {
            setRewardsFetchPending(true);
            void reward.fetchAvailableRewards().finally(() => {
                if (!cancelled) setRewardsFetchPending(false);
            });
        }

        if (cases.hasLoadedActiveCases) {
            setCasesFetchPending(false);
        } else {
            setCasesFetchPending(true);
            void cases.fetchActiveCases().finally(() => {
                if (!cancelled) setCasesFetchPending(false);
            });
        }

        return () => {
            cancelled = true;
        };
    }, [isOpen, reward, cases]);

    const sliderRewards = useMemo(
        () =>
            reward.availableRewards.filter(
                (item) => item.preview?.url || item.mediaFile?.url,
            ),
        [reward.availableRewards],
    );

    const sortedCases = useMemo(
        () => sortedCasesByPrice(cases.activeCases),
        [cases.activeCases],
    );

    const [rewardAnimations] = useAnimationLoader<Reward>(
        sliderRewards,
        (item) => item.preview || item.mediaFile || null,
        [sliderRewards.length],
    );

    const [caseAnimations] = useAnimationLoader<CaseBox>(
        sortedCases,
        (box) => box.mediaFile,
        [sortedCases.length],
    );

    const isLoading = rewardsFetchPending || casesFetchPending;

    const slideCount = sliderRewards.length;
    const showLeftArrow = slideCount > 1 && activeSlideIndex > 0;
    const showRightArrow = slideCount > 1 && activeSlideIndex < slideCount - 1;

    const scrollToSlide = useCallback((index: number) => {
        const el = sliderRef.current;
        if (!el) return;
        const clamped = Math.max(0, Math.min(index, slideCount - 1));
        el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' });
        setActiveSlideIndex(clamped);
    }, [slideCount]);

    const handleSliderScroll = useCallback(() => {
        const el = sliderRef.current;
        if (!el || el.clientWidth <= 0) return;
        const index = Math.round(el.scrollLeft / el.clientWidth);
        setActiveSlideIndex((prev) => (prev === index ? prev : index));
    }, []);

    const handlePrevSlide = useCallback(() => {
        hapticImpact('soft');
        scrollToSlide(activeSlideIndex - 1);
    }, [activeSlideIndex, hapticImpact, scrollToSlide]);

    const handleNextSlide = useCallback(() => {
        hapticImpact('soft');
        scrollToSlide(activeSlideIndex + 1);
    }, [activeSlideIndex, hapticImpact, scrollToSlide]);

    const handlePlay = useCallback(() => {
        if (playClickedRef.current) return;
        playClickedRef.current = true;

        hapticImpact('soft');
        trackEvent('first_arc_intro_play_click', { gems: FIRST_ARC_GEMS });

        if (user.energy <= 0) {
            chat.setInsufficientEnergy(true);
            user.dismissFirstArcIntroModal();
            return;
        }

        hapticNotification('success');
        user.completeFirstArcIntroModal();
        void chat.sendMessage(language === 'en' ? 'start' : 'старт').catch((error) => {
            console.error('Failed to send start message from first arc intro:', error);
        });
    }, [chat, hapticImpact, hapticNotification, language, user]);

    const handleClose = () => {
        user.dismissFirstArcIntroModal();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            closeOnOverlayClick={false}
            swipeToClose={false}
            hideCloseButton
            headerIconContainerClassName="bg-gradient-to-br from-violet-600 to-fuchsia-600 shadow-lg"
            contentClassName="px-0 pt-2"
            footer={
                <Button
                    onClick={handlePlay}
                    disabled={isLoading}
                    variant="gradient"
                    size="lg"
                    className="w-full"
                    icon="fa-solid fa-play"
                >
                    {t('firstArcIntroPlay')}
                </Button>
            }
        >
            {isLoading ? (
                <div className="relative py-10 min-h-[200px]">
                    <LoadingIndicatorContent layout="contained" />
                </div>
            ) : (
                <div className="flex flex-col gap-5">
                    {sliderRewards.length > 0 ? (
                        <div className="flex flex-col gap-2">
                            <div className="px-4 text-center text-md font-semibold text-gray-300">
                                {t('firstArcIntroRewards')}
                            </div>
                            <div className="relative">
                                {showLeftArrow ? (
                                    <button
                                        type="button"
                                        onClick={handlePrevSlide}
                                        className="absolute left-2 top-[38%] z-10 -translate-y-1/2 animate-swipe-hint-left cursor-pointer"
                                        aria-label="Previous"
                                    >
                                        <div className="w-10 h-10 flex items-center justify-center">
                                            <i className="fas fa-chevron-left text-white/90 text-xl" />
                                        </div>
                                    </button>
                                ) : null}
                                {showRightArrow ? (
                                    <button
                                        type="button"
                                        onClick={handleNextSlide}
                                        className="absolute right-2 top-[38%] z-10 -translate-y-1/2 animate-swipe-hint-right cursor-pointer"
                                        aria-label="Next"
                                    >
                                        <div className="w-10 h-10 flex items-center justify-center">
                                            <i className="fas fa-chevron-right text-white/90 text-xl" />
                                        </div>
                                    </button>
                                ) : null}
                                <div
                                    ref={sliderRef}
                                    onScroll={handleSliderScroll}
                                    className="flex w-full snap-x snap-mandatory overflow-x-auto hide-scrollbar ios-scroll"
                                    aria-label={t('firstArcIntroRewards')}
                                >
                                    {sliderRewards.map((item) => {
                                        const title = item.name;
                                        const media = item.preview || item.mediaFile;

                                        return (
                                            <div
                                                key={item.id}
                                                className="snap-center shrink-0 w-full min-w-full px-4"
                                            >
                                                <div className="relative w-full flex flex-col items-center gap-2 py-2">
                                                    {media ? (
                                                        <LazyMediaRenderer
                                                            mediaFile={media}
                                                            animations={rewardAnimations}
                                                            name={title}
                                                            className="w-[60%] h-auto object-contain mx-auto block"
                                                            loop={false}
                                                            loadOnIntersect={false}
                                                            autoplay
                                                        />
                                                    ) : (
                                                        <div className="w-[60%] aspect-square flex items-center justify-center mx-auto">
                                                            <i className="fa-solid fa-gift text-5xl text-white/40" />
                                                        </div>
                                                    )}
                                                    <div className="w-full text-center px-2">
                                                        <div className="text-white font-semibold truncate">
                                                            {title}
                                                        </div>
                                                        <div className="text-xs text-gray-300 flex items-center justify-center gap-1">
                                                            {item.price}
                                                            <i className="fa-solid fa-gem text-secondary-gradient text-[10px]" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {slideCount > 1 ? (
                                    <div className="flex justify-center gap-2 mt-3 px-4">
                                        {sliderRewards.map((item, idx) => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => {
                                                    hapticImpact('soft');
                                                    scrollToSlide(idx);
                                                }}
                                                className={`h-2 rounded-full transition-all ${
                                                    activeSlideIndex === idx
                                                        ? 'bg-white w-6'
                                                        : 'bg-white/50 w-2'
                                                }`}
                                                aria-label={`${t('firstArcIntroRewards')} ${idx + 1}`}
                                            />
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    ) : null}

                    <div className="px-4">
                        <div className="rounded-2xl btn-default-silver-border bg-black/30 px-4 py-3 flex items-center justify-between">
                            <span className="text-sm text-gray-300">
                                {t('firstArcIntroGems')}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-white">
                                    +{FIRST_ARC_GEMS}
                                </span>
                                <i className="fa-solid fa-gem text-secondary-gradient text-xl" />
                            </div>
                        </div>
                    </div>

                    {sortedCases.length > 0 ? (
                        <div className="flex flex-col gap-2 px-4 pb-2">
                            <div className="text-sm font-semibold text-gray-300">
                                {t('firstArcIntroCases')}
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {sortedCases.map((box) => {
                                    const title =
                                        language === 'en'
                                            ? box.nameEn || box.name
                                            : box.name;
                                    const openCount =
                                        box.price > 0
                                            ? Math.floor(FIRST_ARC_GEMS / box.price)
                                            : 0;

                                    return (
                                        <div
                                            key={box.id}
                                            className="relative rounded-xl btn-default-silver-border bg-black/30 p-3 flex flex-col items-center gap-2"
                                        >
                                            {openCount > 0 ? (
                                                <div className="absolute top-2 right-2 z-[2] rounded-full bg-black/65 px-2 py-0.5 text-[11px] font-semibold leading-none ring-1 ring-white/20">
                                                    <span className="text-gray-300">{`x${openCount}`}</span>
                                                </div>
                                            ) : null}
                                            <div className="w-16 h-16 flex items-center justify-center">
                                                <LazyMediaRenderer
                                                    mediaFile={box.mediaFile}
                                                    animations={caseAnimations}
                                                    name={title}
                                                    className="w-full h-full object-contain"
                                                    loop={false}
                                                    loadOnIntersect={false}
                                                />
                                            </div>
                                            <div className="text-xs text-gray-300 text-center line-clamp-2">
                                                {title}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : null}
                </div>
            )}
        </Modal>
    );
});

export default FirstArcIntroModal;
