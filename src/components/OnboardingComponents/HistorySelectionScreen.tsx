import React from 'react';
import { motion } from 'motion/react';
import { useTranslate } from '@/utils/useTranslate';
import { TransitionPanel } from '@/components/ui/transitionPanel';
import { useSwipe } from '@/utils/useSwipe';
import useMeasure from 'react-use-measure';
import type { Agent } from '@/http/agentAPI';
import HistoryCard from './HistoryCard';
import NavigationControls from './NavigationControls';

interface HistorySelectionScreenProps {
    histories: Agent[];
    loading: boolean;
    saving: boolean;
    activeIndex: number;
    direction: number;
    selectText: string;
    loadingText: string;
    noHistoriesText: string;
    getHistoryDisplayName: (historyName: string) => string;
    onSetActiveIndex: (index: number) => void;
    onSelectHistory: (historyName: string) => void;
}

const HistorySelectionScreen: React.FC<HistorySelectionScreenProps> = ({
    histories,
    loading,
    saving,
    activeIndex,
    direction,
    selectText,
    loadingText,
    noHistoriesText,
    getHistoryDisplayName,
    onSetActiveIndex,
    onSelectHistory
}) => {
    const { t } = useTranslate();
    const [ref, bounds] = useMeasure();

    const handleSwipeLeft = () => {
        if (activeIndex < histories.length - 1) {
            onSetActiveIndex(activeIndex + 1);
        }
    };

    const handleSwipeRight = () => {
        if (activeIndex > 0) {
            onSetActiveIndex(activeIndex - 1);
        }
    };

    const swipeHandlers = useSwipe({
        onSwipeLeft: handleSwipeLeft,
        onSwipeRight: handleSwipeRight,
        threshold: 50
    });

    return (
        <div className="flex flex-col justify-between h-full p-4 pb-8 gap-4">
            {/* Title */}
            <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-bold text-white text-center"
            >
                {t('selectHistory')}
            </motion.h2>

            {/* History Selection Panel */}
            {loading ? (
                <div className="flex justify-center items-center flex-1">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : histories.length > 0 ? (
                <div className="relative flex flex-col justify-between">
                    <div
                        className="relative overflow-hidden select-none"
                        style={{
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none'
                        }}
                        {...swipeHandlers}
                        onMouseDown={swipeHandlers.onMouseDown}
                        onMouseMove={swipeHandlers.onMouseMove}
                        onMouseUp={swipeHandlers.onMouseUp}
                    >
                        <TransitionPanel
                            activeIndex={activeIndex}
                            variants={{
                                enter: (direction) => ({
                                    x: direction > 0 ? 300 : -300,
                                    opacity: 0,
                                    height: bounds.height > 0 ? bounds.height : 'auto',
                                    position: 'initial',
                                }),
                                center: {
                                    zIndex: 1,
                                    x: 0,
                                    opacity: 1,
                                    height: bounds.height > 0 ? bounds.height : 'auto',
                                },
                                exit: (direction) => ({
                                    zIndex: 0,
                                    x: direction < 0 ? 300 : -300,
                                    opacity: 0,
                                    position: 'absolute',
                                    top: 0,
                                    width: '100%',
                                }),
                            }}
                            transition={{
                                x: { type: 'spring', stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 },
                            }}
                            custom={direction}
                        >
                            {histories.map((agent) => (
                                <div key={agent.id} ref={ref} className='flex flex-col w-full justify-center items-center'>
                                    <HistoryCard
                                        title={getHistoryDisplayName(agent.historyName)}
                                        description={agent.description || t('startYourAdventure')}
                                        selectText={selectText}
                                        loadingText={loadingText}
                                        isSaving={saving}
                                        preview={agent.preview}
                                        onSelect={() => onSelectHistory(agent.historyName)}
                                    />
                                </div>
                            ))}
                        </TransitionPanel>
                    </div>

                    {/* Navigation Controls */}
                    <NavigationControls
                        activeIndex={activeIndex}
                        totalItems={histories.length}
                        onPrevious={() => onSetActiveIndex(activeIndex - 1)}
                        onNext={() => onSetActiveIndex(activeIndex + 1)}
                    />
                </div>
            ) : (
                <div className="text-center text-white py-20">
                    <p>{noHistoriesText}</p>
                </div>
            )}
        </div>
    );
};

export default HistorySelectionScreen;

