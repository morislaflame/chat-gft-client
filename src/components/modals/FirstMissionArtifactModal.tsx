import React, { useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/context';
import { useTranslate } from '@/utils/useTranslate';
import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import { FireworksBackground } from '@/components/ui/backgrounds/fireworks-background';
import { getArtifactBackdropSrcByBoostType } from '@/utils/rewardBackdrop';

const FirstMissionArtifactModal: React.FC = observer(() => {
    const { chat, user } = useContext(Context) as IStoreContext;
    const { t } = useTranslate();
    const artifact = chat.pendingFirstMissionArtifact;
    const isOpen = artifact?.isOpen ?? false;
    const language = user.user?.language || 'ru';

    const [fireworksPlaying, setFireworksPlaying] = useState(false);
    const [entered, setEntered] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFireworksPlaying(true);
            setEntered(true);
        } else {
            setEntered(false);
        }
    }, [isOpen]);

    const onFireworksComplete = useCallback(() => {
        setFireworksPlaying(false);
    }, []);

    const handleContinue = () => {
        chat.closeFirstMissionArtifact();
    };

    if (!artifact) return null;

    const name = language === 'en' ? (artifact.nameEn || artifact.name) : artifact.name;
    const description =
        (language === 'en' ? artifact.descriptionEn : artifact.description) || null;
    const mediaUrl = artifact.media?.url;
    const mimeType = artifact.media?.mimeType ?? '';
    const isImage = Boolean(mediaUrl && mimeType.startsWith('image/'));

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={handleContinue}
                closeOnOverlayClick={false}
                swipeToClose={false}
                hideCloseButton
                backdropImageSrc={getArtifactBackdropSrcByBoostType(artifact.boostType)}
                title={t('firstMissionArtifactReceived')}
                description={t('firstMissionArtifactReceivedSubtitle')}
                headerIcon={<i className="fa-solid fa-gem text-white text-2xl" />}
                headerIconContainerClassName="bg-gradient-to-br from-amber-600 to-amber-900 border border-amber-500/30"
                footer={
                    <Button
                        onClick={handleContinue}
                        variant="gradient"
                        size="lg"
                        className="w-full"
                        icon="fa-solid fa-check"
                    >
                        {t('firstMissionArtifactContinue')}
                    </Button>
                }
            >
                <div className="flex flex-col items-center gap-5 px-4 pb-2">
                    <AnimatePresence>
                        {entered && (
                            <motion.div
                                key="first-mission-artifact"
                                initial={{ scale: 0.5, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                transition={{ type: 'spring', stiffness: 280, damping: 20, delay: 0.1 }}
                                className="relative"
                            >
                                <div className="w-40 h-40 rounded-2xl overflow-hidden flex items-center justify-center btn-default-silver-border">
                                    {isImage ? (
                                        <img
                                            src={mediaUrl}
                                            alt={name}
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <i className="fa-solid fa-gem text-6xl text-amber-400/90" />
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {entered && (
                            <motion.div
                                key="first-mission-artifact-name"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="flex flex-col items-center gap-1 text-center"
                            >
                                <span className="text-xl font-bold text-white">{name}</span>
                                {description ? (
                                    <span className="text-sm text-zinc-400 leading-relaxed">
                                        {description}
                                    </span>
                                ) : null}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Modal>

            {typeof document !== 'undefined' && fireworksPlaying
                ? createPortal(
                      <div className="fixed inset-0 z-[10002] pointer-events-none">
                          <FireworksBackground
                              className="absolute inset-0"
                              particleCount={70}
                              transparent
                              burstCount={4}
                              onBurstComplete={onFireworksComplete}
                          />
                      </div>,
                      document.body,
                  )
                : null}
        </>
    );
});

export default FirstMissionArtifactModal;
