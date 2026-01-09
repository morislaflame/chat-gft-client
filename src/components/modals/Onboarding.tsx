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
import AgentVideoModal from '@/components/modals/AgentVideoModal';
import { getHistoryDisplayName } from '@/components/OnboardingComponents/onboardingUtils';
import type { MediaFile } from '@/types/types';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import { trackEvent } from '@/utils/analytics';

interface OnboardingProps {
    onComplete: () => void;
    initialStep?: 'welcome' | 'select';
    isFromHeader?: boolean;
    onClose?: () => void;
}

const Onboarding: React.FC<OnboardingProps> = observer(({ onComplete, initialStep = 'welcome', isFromHeader = false, onClose }) => {
    const { agent } = useContext(Context) as IStoreContext;
    const { t, language } = useTranslate();
    const [step, setStep] = useState<'welcome' | 'select'>(initialStep);
    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const [selectedVideo, setSelectedVideo] = useState<MediaFile | null>(null);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const {hapticImpact, hapticNotification} = useHapticFeedback();
    const startTsRef = useRef<number>(Date.now());
    const lastStepRef = useRef<'welcome' | 'select' | null>(null);

    // Если начальный шаг - выбор истории, загружаем агентов сразу
    useEffect(() => {
        agent.fetchPublicAgents();
    }, [agent]);

    useEffect(() => {
        // onboarding_view step: 1=welcome, 2=select
        const stepNumber = step === 'welcome' ? 1 : 2;
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

    const handleSelectHistory = async (historyName: string) => {
        if (agent.saving) return;
        
        try {
            await agent.selectHistory(historyName);
            
            const selectedAgent = agent.getAgentByHistoryName(historyName);
            
            if (selectedAgent?.video?.url) {
                setSelectedVideo(selectedAgent.video);
                setShowVideoModal(true);
            } else {
                trackEvent('onboarding_complete', {
                    variant: isFromHeader ? 'header' : 'default',
                    time_spent_sec: Math.max(0, Math.round((Date.now() - startTsRef.current) / 1000)),
                });
                onComplete();
            }
        } catch (error) {
            console.error('Failed to select history:', error);
        }
    };

    const handleVideoClose = () => {
        hapticNotification('success');
        setShowVideoModal(false);
        setSelectedVideo(null);
        // После закрытия видео закрываем онбординг
        trackEvent('onboarding_complete', {
            variant: isFromHeader ? 'header' : 'default',
            time_spent_sec: Math.max(0, Math.round((Date.now() - startTsRef.current) / 1000)),
        });
        onComplete();
    };

    const getHistoryName = (historyName: string) => getHistoryDisplayName(historyName, language);

    const onboardingContent = (
        <div
            className="fixed inset-0 z-[10000] flex flex-col overflow-hidden telegram-padding bg-primary"
        >
            {/* Background Images with smooth crossfade transition */}
            <motion.div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(${onboardingImageWebp})`
                }}
                animate={{
                    opacity: step === 'welcome' ? 1 : 0,
                    scale: [1, 1.05, 1],
                }}
                transition={{
                    opacity: { duration: 0.5, ease: "easeInOut" },
                    scale: {
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }
                }}
            />
            <motion.div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(${onboardingImageJpg})`
                }}
                animate={{
                    opacity: step === 'select' ? 1 : 0,
                    scale: [1, 1.05, 1],
                }}
                transition={{
                    opacity: { duration: 0.5, ease: "easeInOut" },
                    scale: {
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }
                }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col h-full">
                {step === 'welcome' ? (
                    <WelcomeScreen
                        joinAdventureText={t('joinAdventure')}
                        onJoinAdventure={() => setStep('select')}
                    />
                ) : (
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
                )}
            </div>
        </div>
    );

    return (
        <>
            {typeof document !== 'undefined'
                ? createPortal(onboardingContent, document.body)
                : null}
            <AgentVideoModal
                isOpen={showVideoModal}
                video={selectedVideo}
                onClose={handleVideoClose}
            />
        </>
    );
});

export default Onboarding;

