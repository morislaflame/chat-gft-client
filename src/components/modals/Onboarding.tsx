import React, { useState, useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import onboardingImage from '@/assets/Onboarding.jpg';
import WelcomeScreen from '@/components/OnboardingComponents/WelcomeScreen';
import HistorySelectionScreen from '@/components/OnboardingComponents/HistorySelectionScreen';
import AgentVideoModal from '@/components/modals/AgentVideoModal';
import { getHistoryDisplayName } from '@/components/OnboardingComponents/onboardingUtils';
import type { MediaFile } from '@/types/types';

interface OnboardingProps {
    onComplete: () => void;
    initialStep?: 'welcome' | 'select';
}

const Onboarding: React.FC<OnboardingProps> = observer(({ onComplete, initialStep = 'welcome' }) => {
    const { agent } = useContext(Context) as IStoreContext;
    const { t, language } = useTranslate();
    const [step, setStep] = useState<'welcome' | 'select'>(initialStep);
    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const [selectedVideo, setSelectedVideo] = useState<MediaFile | null>(null);
    const [showVideoModal, setShowVideoModal] = useState(false);

    // Если начальный шаг - выбор истории, загружаем агентов сразу
    useEffect(() => {
        agent.fetchPublicAgents();
    }, [agent]);

    const handleSetActiveIndex = (newIndex: number) => {
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
                onComplete();
            }
        } catch (error) {
            console.error('Failed to select history:', error);
        }
    };

    const handleVideoClose = () => {
        setShowVideoModal(false);
        setSelectedVideo(null);
        // После закрытия видео закрываем онбординг
        onComplete();
    };

    const getHistoryName = (historyName: string) => getHistoryDisplayName(historyName, language);

    const onboardingContent = (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex flex-col overflow-hidden telegram-padding"
        >
            {/* Background Image */}
            <motion.div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url(${onboardingImage})`
                }}
                animate={{
                    scale: [1, 1.05, 1],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
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
                    />
                )}
            </div>
        </motion.div>
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

