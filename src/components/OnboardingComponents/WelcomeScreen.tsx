import React, { useContext, useState } from 'react';
import { motion } from 'motion/react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import Button from '@/components/ui/button';
import { TransitionPanel } from '@/components/ui/transitionPanel';
import { useSwipe } from '@/utils/useSwipe';
import useMeasure from 'react-use-measure';
import { useHapticFeedback } from '@/utils/useHapticFeedback';

interface WelcomeScreenProps {
    joinAdventureText: string;
    onJoinAdventure: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = observer(({
    joinAdventureText,
    onJoinAdventure
}) => {
    const { user } = useContext(Context) as IStoreContext;
    const { t } = useTranslate();
    const { hapticImpact } = useHapticFeedback();
    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(1);
    const [ref, bounds] = useMeasure();
    
    // Получаем имя пользователя: username, firstName или "Странник"/"Wanderer"
    const getUserName = () => {
        const userData = user.user;
        if (userData?.firstName) return userData.firstName;
        if (userData?.username) return userData.username;
        return t('wanderer');
    };
    
    const userName = getUserName();

    const handleSetActiveIndex = (newIndex: number) => {
        hapticImpact('soft');
        if (newIndex < 0 || newIndex > 1) return;
        setDirection(newIndex > activeIndex ? 1 : -1);
        setActiveIndex(newIndex);
    };

    const handleSwipeLeft = () => {
        if (activeIndex < 1) {
            handleSetActiveIndex(activeIndex + 1);
        }
    };

    const handleSwipeRight = () => {
        if (activeIndex > 0) {
            handleSetActiveIndex(activeIndex - 1);
        }
    };

    const swipeHandlers = useSwipe({
        onSwipeLeft: handleSwipeLeft,
        onSwipeRight: handleSwipeRight,
        threshold: 50
    });

    const cards = [
        // Первая карточка - приветствие (прозрачный фон)
        <div key="welcome" ref={ref} className="flex flex-col justify-between h-full w-full">
            <div className="flex-1 flex justify-center items-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center"
                >
                    <h1 className="text-4xl font-bold text-white mb-4">
                        {t('welcome')} {userName}!
                    </h1>
                    <div className="text-md text-white/90">
                            <p>{t('welcomeDescription')}</p>
                            <p>{t('welcomeDescription2')}</p>
                        </div>
                </motion.div>
            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6"
            >
                <Button
                    onClick={() => handleSetActiveIndex(1)}
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    icon="fas fa-chevron-right"
                >
                    {t('joinAdventure')}
                </Button>
            </motion.div>
        </div>,
        
        // Вторая карточка - объяснение игры (с блюром)
        <div key="explanation" ref={ref} className="flex flex-col justify-between gap-4">
            <div className="flex-1 flex flex-col justify-center backdrop-blur-sm bg-white/5h-full w-full backdrop-blur-sm bg-white/5 rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-white mb-4 text-center">
                    {t('gameExplanationTitle')}
                </h2>
                <div className="space-y-2 text-white">
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">1.</span>
                        <p className="text-white/90 text-md">{t('gameExplanation1')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">2.</span>
                        <p className="text-white/90 text-md">{t('gameExplanation2')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">3.</span>
                        <p className="text-white/90 text-md">{t('gameExplanation3')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-bold text-lg">4.</span>
                        <p className="text-white/90 text-md">{t('gameExplanation4')}</p>
                    </div>
                </div>
            </div>

            {/* Join Adventure Button - показывается только на второй карточке */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Button
                    onClick={onJoinAdventure}
                    variant="secondary"
                    size="lg"
                    className="w-full"
                    icon="fas fa-rocket"
                >
                    {joinAdventureText}
                </Button>
            </motion.div>
        </div>
    ];
    
    return (
        <div className="flex flex-col justify-end h-full p-6 pb-8">
            <div className="relative flex flex-col justify-center h-full">
                <div
                    className="relative overflow-hidden select-none flex-1 flex items-center h-full justify-center"
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
                        {cards}
                    </TransitionPanel>
                </div>

                {/* Navigation Controls */}
                <div className="flex justify-center gap-2 mt-4">
                    <button
                        onClick={() => handleSetActiveIndex(0)}
                        className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                            activeIndex === 0 ? 'bg-white w-6' : 'bg-white/50'
                        }`}
                        aria-label="Go to welcome card"
                    />
                    <button
                        onClick={() => handleSetActiveIndex(1)}
                        className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                            activeIndex === 1 ? 'bg-white w-6' : 'bg-white/50'
                        }`}
                        aria-label="Go to explanation card"
                    />
                </div>
            </div>
        </div>
    );
});

export default WelcomeScreen;
