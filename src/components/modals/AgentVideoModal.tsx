import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { observer } from 'mobx-react-lite';
import { useTranslate } from '@/utils/useTranslate';
import type { MediaFile } from '@/types/types';

interface AgentVideoModalProps {
    isOpen: boolean;
    video: MediaFile | null;
    onClose: () => void;
}

const AgentVideoModal: React.FC<AgentVideoModalProps> = observer(({ isOpen, video, onClose }) => {
    const { t } = useTranslate();
    const [videoEnded, setVideoEnded] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (isOpen && videoRef.current && video?.url) {
            setVideoEnded(false);
            // Пытаемся запустить воспроизведение
            videoRef.current.play().catch((error) => {
                console.error('Error playing video:', error);
            });
        }
    }, [isOpen, video]);

    const handleVideoEnd = async () => {
        setVideoEnded(true);

        // Закрываем модальное окно через небольшую задержку после окончания видео
        setTimeout(() => {
            onClose();
        }, 1000);
    };

    const handleSkip = async () => {
        onClose();
    };

    if (!video || !video.url) {
        return null;
    }

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[10001] bg-black flex items-center justify-center"
                >
                    <div className="relative w-full h-full flex flex-col">
                        {/* Video Container */}
                        <div className="flex-1 flex items-center justify-center">
                            <video
                                ref={videoRef}
                                src={video.url}
                                autoPlay
                                onEnded={handleVideoEnd}
                                onError={(e) => {
                                    console.error('Video error:', e);
                                    console.error('Video:', video);
                                }}
                                onLoadedData={() => {
                                    console.log('Video loaded:', video.url);
                                    videoRef.current?.play().catch((error) => {
                                        console.error('Error playing video after load:', error);
                                    });
                                }}
                                className="max-w-full max-h-full"
                                controls={false}
                                playsInline
                            />
                        </div>

                        {/* Controls */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                            <div className="flex items-center justify-end">
                                {/* <div className="text-white">
                                    {videoEnded ? (
                                        <p className="text-sm">Video completed</p>
                                    ) : (
                                        <p className="text-sm">Watch the introduction video</p>
                                    )}
                                </div> */}
                                {!videoEnded && (
                                    <button
                                        onClick={handleSkip}
                                        className="px-4 py-2 hover:bg-white/10 text-white rounded-lg transition-colors"
                                    >
                                        {t('skip')}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // Рендерим модалку через Portal в document.body
    return typeof document !== 'undefined' 
        ? createPortal(modalContent, document.body)
        : null;
});

export default AgentVideoModal;

