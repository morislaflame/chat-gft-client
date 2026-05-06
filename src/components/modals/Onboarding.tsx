import React, { useState, useEffect, useContext, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import onboardingImageWebp from '@/assets/Onboarding.webp';
import onboardingImageJpg from '@/assets/Onboarding.jpg';
import WelcomeScreen from '@/components/OnboardingComponents/WelcomeScreen';
import HistorySelectionScreen from '@/components/OnboardingComponents/HistorySelectionScreen';
import MissionPathScreen from '@/components/OnboardingComponents/MissionPathScreen';
import AgentVideoModal from '@/components/modals/AgentVideoModal';
import { getHistoryDisplayName } from '@/components/OnboardingComponents/onboardingUtils';
import type { MediaFile } from '@/types/types';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import { trackEvent } from '@/utils/analytics';
import { compareMissionsByStoryOrder } from '@/utils/missionStoryOrder';
import { LoadingIndicatorContent } from '@/components/CoreComponents/LoadingIndicator';

type Step = 'welcome' | 'select' | 'missions';

interface OnboardingProps {
    onComplete: () => void;
    initialStep?: Step;
    isFromHeader?: boolean;
    onClose?: () => void;
}

const Onboarding: React.FC<OnboardingProps> = observer(
    ({ onComplete, initialStep = 'welcome', isFromHeader = false, onClose }) => {
        const { agent, chat } = useContext(Context) as IStoreContext;
        const { t, language } = useTranslate();
        const [step, setStep] = useState<Step>(() =>
            initialStep === 'missions' || initialStep === 'select' ? initialStep : 'welcome',
        );
        const [activeIndex, setActiveIndex] = useState(0);
        const [direction, setDirection] = useState(1);
        const [selectedVideo, setSelectedVideo] = useState<MediaFile | null>(null);
        const [showVideoModal, setShowVideoModal] = useState(false);
        /** Пока грузим чат после выбора истории — не показывать снова экран выбора (мигание после закрытия видео). */
        const [finishingOnboardingToChat, setFinishingOnboardingToChat] = useState(false);
        const { hapticImpact, hapticNotification } = useHapticFeedback();
        const startTsRef = useRef<number>(Date.now());
        const lastStepRef = useRef<Step | null>(null);

        useEffect(() => {
            agent.fetchPublicAgents();
        }, [agent]);

        useEffect(() => {
            if (step === 'missions') {
                void chat.loadChatHistory(true);
            }
        }, [step, chat]);

        useEffect(() => {
            const stepNumber = step === 'welcome' ? 1 : step === 'select' ? 2 : 3;
            if (lastStepRef.current === step) return;
            lastStepRef.current = step;
            trackEvent('onboarding_view', {
                step: stepNumber,
                variant: isFromHeader ? 'header' : 'default',
            });
        }, [step, isFromHeader]);

        const handleSetActiveIndex = (newIndex: number) => {
            hapticImpact('soft');
            if (newIndex < 0 || newIndex >= agent.agents.length) return;
            setDirection(newIndex > activeIndex ? 1 : -1);
            setActiveIndex(newIndex);
        };

        const finalizeFirstTimeOnboardingToChat = async () => {
            if (!isFromHeader) {
                setFinishingOnboardingToChat(true);
            }
            try {
                const sorted = chat.missions.slice().sort(compareMissionsByStoryOrder);
                let chosenId: number | null = null;
                for (const m of sorted) {
                    if (chat.canSelectMission(m.id)) {
                        chosenId = m.id;
                        break;
                    }
                }
                if (chosenId != null) {
                    await chat.selectMissionForChat(chosenId);
                } else {
                    await chat.loadChatHistory(true);
                }
            } catch (error) {
                console.error('Failed to open chat after onboarding history pick:', error);
            }
            trackEvent('onboarding_complete', {
                variant: isFromHeader ? 'header' : 'default',
                time_spent_sec: Math.max(0, Math.round((Date.now() - startTsRef.current) / 1000)),
            });
            onComplete();
        };

        const handleSelectHistory = async (historyName: string) => {
            if (agent.saving) return;

            try {
                await agent.selectHistory(historyName);

                const selectedAgent = agent.getAgentByHistoryName(historyName);

                const afterHistoryPick = async () => {
                    if (!isFromHeader) {
                        await finalizeFirstTimeOnboardingToChat();
                    } else {
                        setStep('missions');
                    }
                };

                if (selectedAgent?.video?.url) {
                    setSelectedVideo(selectedAgent.video);
                    setShowVideoModal(true);
                } else {
                    await afterHistoryPick();
                }
            } catch (error) {
                console.error('Failed to select history:', error);
            }
        };

        const handleVideoClose = () => {
            hapticNotification('success');
            setShowVideoModal(false);
            setSelectedVideo(null);
            if (!isFromHeader) {
                void finalizeFirstTimeOnboardingToChat();
            } else {
                setStep('missions');
            }
        };

        const getHistoryName = (historyName: string) => {
            const fallback = getHistoryDisplayName(historyName, language);
            const a = agent.getAgentByHistoryName(historyName);
            if (!a) return fallback;
            if (language === 'en') return a.displayNameEn || a.displayName || fallback;
            return a.displayName || fallback;
        };

        const goToHistorySelectionFromMissions = () => {
            setStep('select');
        };

        const onboardingContent = (
            <motion.div
                className="fixed inset-0 z-[10000] flex flex-col overflow-hidden telegram-padding bg-primary origin-center"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <motion.div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url(${onboardingImageWebp})`,
                    }}
                    animate={{
                        opacity: step === 'welcome' ? 1 : 0,
                        scale: [1, 1.05, 1],
                    }}
                    transition={{
                        opacity: { duration: 0.5, ease: 'easeInOut' },
                        scale: {
                            duration: 15,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        },
                    }}
                />
                <motion.div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url(${onboardingImageJpg})`,
                    }}
                    animate={{
                        opacity: step === 'welcome' ? 0 : 1,
                        scale: [1, 1.05, 1],
                    }}
                    transition={{
                        opacity: { duration: 0.5, ease: 'easeInOut' },
                        scale: {
                            duration: 15,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        },
                    }}
                />

                <div className="relative z-10 flex flex-col h-full min-h-0">
                    {finishingOnboardingToChat && !isFromHeader ? (
                        <div className="relative flex flex-1 flex-col min-h-0 min-w-0">
                            <LoadingIndicatorContent layout="contained" />
                        </div>
                    ) : step === 'welcome' ? (
                        <WelcomeScreen
                            joinAdventureText={t('joinAdventure')}
                            onJoinAdventure={() => setStep('select')}
                        />
                    ) : step === 'select' ? (
                        <HistorySelectionScreen
                            histories={agent.agents}
                            loading={agent.loading}
                            saving={agent.saving}
                            activeIndex={activeIndex}
                            direction={direction}
                            selectText={t('select')}
                            loadingText={t('loading')}
                            noHistoriesText={t('noHistoriesAvailable')}
                            getHistoryDisplayName={getHistoryName}
                            onSetActiveIndex={handleSetActiveIndex}
                            onSelectHistory={handleSelectHistory}
                            isFromHeader={isFromHeader}
                            onClose={onClose}
                        />
                    ) : (
                        <MissionPathScreen
                            chat={chat}
                            onChooseHistory={goToHistorySelectionFromMissions}
                            onMissionChosen={() => {
                                trackEvent('onboarding_complete', {
                                    variant: isFromHeader ? 'header' : 'default',
                                    time_spent_sec: Math.max(
                                        0,
                                        Math.round((Date.now() - startTsRef.current) / 1000),
                                    ),
                                });
                                onComplete();
                            }}
                            isFromHeader={isFromHeader}
                            onClose={onClose}
                        />
                    )}
                </div>
            </motion.div>
        );

        return (
            <>
                {typeof document !== 'undefined' ? createPortal(onboardingContent, document.body) : null}
                <AgentVideoModal isOpen={showVideoModal} video={selectedVideo} onClose={handleVideoClose} />
            </>
        );
    },
);

export default Onboarding;
