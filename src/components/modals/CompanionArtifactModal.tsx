import React, { useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { Context, type IStoreContext } from '@/store/context';
import { useTranslate } from '@/utils/useTranslate';
import Modal from '@/components/CoreComponents/Modal';
import Button from '@/components/ui/button';
import { FireworksBackground } from '@/components/ui/backgrounds/fireworks-background';
import { PROFILE_ROUTE } from '@/utils/consts';

const CompanionArtifactModal: React.FC = observer(() => {
    const { chat, user } = useContext(Context) as IStoreContext;
    const { t } = useTranslate();
    const navigate = useNavigate();
    const companion = chat.pendingCompanionArtifact;
    const isOpen = companion?.isOpen ?? false;
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

    const handleClose = () => {
        chat.closeCompanionArtifact();
    };

    const handleGoToProfile = () => {
        chat.closeCompanionArtifact();
        navigate(PROFILE_ROUTE);
    };

    if (!companion) return null;

    const name = language === 'en' ? (companion.nameEn || companion.name) : companion.name;
    const description =
        (language === 'en' ? companion.descriptionEn : companion.description) || null;
    const mediaUrl = companion.media?.url;
    const mimeType = companion.media?.mimeType ?? '';
    const isImage = Boolean(mediaUrl && mimeType.startsWith('image/'));

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={handleClose}
                closeOnOverlayClick={false}
                swipeToClose={false}
                hideCloseButton
                title={t('companionReceived')}
                description={t('companionReceivedSubtitle')}
                headerIcon={<i className="fa-solid fa-paw text-white text-2xl" />}
                headerIconContainerClassName="bg-user-message"
                footer={
                    <div className="flex flex-col gap-2 w-full">
                        <Button
                            onClick={handleGoToProfile}
                            variant="gradient"
                            size="lg"
                            className="w-full"
                            icon="fa-solid fa-user"
                        >
                            {t('companionGoToProfile')}
                        </Button>
                        <Button
                            onClick={handleClose}
                            variant="default"
                            size="lg"
                            className="w-full"
                        >
                            {t('companionContinue')}
                        </Button>
                    </div>
                }
            >
                <div className="flex flex-col items-center gap-5 px-4 pb-2">
                    {/* Artifact image */}
                    <AnimatePresence>
                        {entered && (
                            <motion.div
                                key="companion-art"
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
                                        <i className="fa-solid fa-paw text-6xl text-secondary-gradient" />
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Name */}
                    <AnimatePresence>
                        {entered && (
                            <motion.div
                                key="companion-name"
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

export default CompanionArtifactModal;
