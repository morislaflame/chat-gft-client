import React, { useCallback, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { Context, type IStoreContext } from '@/store/context';
import { useTranslate } from '@/utils/useTranslate';
import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import { PROFILE_ROUTE, buildProfileStoryPath } from '@/utils/consts';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import { openStoryLevel } from '@/http/userAPI';
import { FireworksBackground } from '@/components/ui/backgrounds/fireworks-background';

export type OpenStoryLevelPrompt = {
    completedLevel: number;
    openLevel: number;
    canOpen: boolean;
    /** После успеха — прокрутить MissionPathScreen к первой миссии уровня */
    scrollMissionPathOnSuccess?: boolean;
};

const OpenStoryLevelModal: React.FC = observer(() => {
    const { chat, user } = useContext(Context) as IStoreContext;
    const { t } = useTranslate();
    const navigate = useNavigate();
    const { hapticImpact, hapticNotification } = useHapticFeedback();
    const [loading, setLoading] = useState(false);
    const [fireworksPlaying, setFireworksPlaying] = useState(false);
    const [fireworksKey, setFireworksKey] = useState(0);

    const onFireworksComplete = useCallback(() => {
        setFireworksPlaying(false);
    }, []);

    const prompt = chat.openStoryLevelPrompt;
    const isOpen = prompt != null;
    const completedLevel = prompt?.completedLevel ?? 1;
    const openLevel = prompt?.openLevel ?? completedLevel + 1;
    const canOpen = prompt?.canOpen === true;
    const historyName = user.user?.selectedHistoryName?.trim() ?? '';

    const handleClose = () => {
        hapticImpact('soft');
        chat.closeOpenStoryLevelPrompt();
    };

    const handleBuy = () => {
        hapticImpact('soft');
        chat.closeOpenStoryLevelPrompt();
        const targetPath = historyName
            ? `${buildProfileStoryPath(historyName)}#artifact-level-${completedLevel}`
            : PROFILE_ROUTE;

        navigate(targetPath);

        if (user.showOnboarding && user.isHistorySelectionFromHeader) {
            user.closeHistorySelection();
        }
    };

    const handleConfirmOpen = async () => {
        if (!historyName || loading) return;
        hapticImpact('soft');
        setLoading(true);
        try {
            const result = await openStoryLevel(historyName, openLevel);
            hapticNotification('success');
            if (result.owned) {
                user.patchArtifactQuantities(result.owned);
            }
            chat.setUnlockedLevels(result.unlockedLevels);
            chat.setPendingOpenStoryLevel(null);
            if (prompt?.scrollMissionPathOnSuccess) {
                chat.setMissionPathScrollToLevel(result.openedLevel ?? openLevel);
            }
            setFireworksKey((k) => k + 1);
            setFireworksPlaying(true);
            chat.closeOpenStoryLevelPrompt();
            void chat.loadChatHistory(true);
        } catch (err) {
            console.error(err);
            const message =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                t('openStoryLevelError');
            window.alert(message);
        } finally {
            setLoading(false);
        }
    };

    const title = canOpen
        ? t('openStoryLevelConfirmTitle').replace('{level}', String(openLevel))
        : t('openStoryLevelMissingTitle').replace('{level}', String(openLevel));

    const description = canOpen
        ? t('openStoryLevelConfirmDescription').replace('{level}', String(completedLevel))
        : t('openStoryLevelMissingDescription');

    return (
        <>
            {typeof document !== 'undefined' && fireworksPlaying ? createPortal(
                <div className="fixed inset-0 z-[10002] pointer-events-none">
                    <FireworksBackground
                        key={fireworksKey}
                        className="absolute inset-0"
                        particleCount={70}
                        transparent
                        burstCount={5}
                        onBurstComplete={onFireworksComplete}
                    />
                </div>,
                document.body,
            ) : null}

            <Modal
            isOpen={isOpen}
            onClose={handleClose}
            overlayClassName="z-[10001]"
            className="z-[10001]"
            title={title}
            description={description}
            footer={
                canOpen ? (
                    <div className="flex flex-col gap-2 w-full">
                        <Button
                            onClick={() => void handleConfirmOpen()}
                            variant="gradient"
                            size="lg"
                            className="w-full"
                            icon="fa-solid fa-door-open"
                            disabled={loading}
                            state={loading ? 'loading' : 'default'}
                        >
                            {t('openStoryLevelConfirmButton').replace('{level}', String(openLevel))}
                        </Button>
                        <Button onClick={handleClose} variant="outline" size="lg" className="w-full">
                            {t('cancel')}
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 w-full">
                        <Button
                            onClick={handleBuy}
                            variant="secondary"
                            size="lg"
                            className="w-full"
                            icon="fa-solid fa-gem"
                        >
                            {t('openStoryLevelBuyButton')}
                        </Button>
                        <Button onClick={handleClose} variant="outline" size="lg" className="w-full">
                            {t('gotIt')}
                        </Button>
                    </div>
                )
            }
        >
        
        </Modal>
        </>
    );
});

export default OpenStoryLevelModal;
