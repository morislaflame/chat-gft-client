import React, { useContext, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import { useTranslate } from '@/utils/useTranslate';
import { useHapticFeedback } from '@/utils/useHapticFeedback';
import GemsInfoModal from '@/components/modals/GemsInfoModal';
import EnergyInfoModal from '@/components/modals/EnergyInfoModal';
import { motion } from 'motion/react';

type RippleState = { x: number; y: number; size: number } | null;

function useRipple() {
    const [ripple, setRipple] = useState<RippleState>(null);

    const onPointerDown = React.useCallback((e: React.PointerEvent<HTMLElement>) => {
        if (e.defaultPrevented || e.button !== 0) return;
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const size = 2 * Math.max(rect.width, rect.height);
        setRipple({ x, y, size });
    }, []);

    const rippleNode = ripple ? (
        <span
            className="absolute pointer-events-none"
            style={{
                left: ripple.x,
                top: ripple.y,
                width: ripple.size,
                height: ripple.size,
                transform: 'translate(-50%, -50%)',
            }}
        >
            <motion.span
                className="block w-full h-full rounded-full bg-white/40"
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                onAnimationComplete={() => setRipple(null)}
            />
        </span>
    ) : null;

    return { onPointerDown, rippleNode };
}

const Header: React.FC = observer(() => {
    const { user, chat, agent } = useContext(Context) as IStoreContext;
    const { t, language } = useTranslate();
    const { hapticImpact } = useHapticFeedback();
    const [gemsInfoOpen, setGemsInfoOpen] = useState(false);
    const [energyInfoOpen, setEnergyInfoOpen] = useState(false);
    const avatarRipple = useRipple();
    const gemsRipple = useRipple();
    const energyRipple = useRipple();
    const languageRipple = useRipple();
    const glassStyle = {
        // border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: 'inset 0 0 24px rgba(0, 0, 0, 0.13)',
    } as const;
    
    // Получаем аватар текущей истории
    const avatarUrl = chat.avatar?.url;
    
    const handleEnergyClick = () => {
        hapticImpact('soft');
        setEnergyInfoOpen(true);
    }

    const handleGemsClick = () => {
        hapticImpact('soft');
        setGemsInfoOpen(true);
    }

    const handleAvatarClick = () => {
        hapticImpact('soft');
        // Открываем онбординг на этапе выбора истории
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const openHistorySelection = (window as any).openHistorySelection;
        if (openHistorySelection) {
            openHistorySelection();
        }
    }

    const handleLanguageClick = () => {
        hapticImpact('soft');
        const newLanguage = language === 'ru' ? 'en' : 'ru';
        user.changeLanguage(newLanguage);
    }

    const historyTitle = (() => {
        const historyName = user.user?.selectedHistoryName || 'starwars';
        const fallback = historyName.charAt(0).toUpperCase() + historyName.slice(1);
        const meta = agent.getAgentByHistoryName(historyName);
        if (!meta) return fallback;
        if (language === 'en') return meta.displayNameEn || meta.displayName || fallback;
        return meta.displayName || fallback;
    })();

    return (
        <div className="fixed top-0 left-0 w-[100vw] z-20 transition-transform duration-300 flex flex-col justify-center items-center header">
            {/* App Header */}
            <div className=" py-4 px-4 flex items-center justify-between gap-6 w-full">
                <div className="relative flex items-center space-x-2 cursor-pointer backdrop-blur-sm btn-default-silver-border-transparent rounded-full p-1 px-3 active:outline-none active:border-secondary-500 hover:border-secondary-500 transition-all duration-200 hover:bg-primary-600"
                style={glassStyle}
                onClick={handleAvatarClick}
                onPointerDown={avatarRipple.onPointerDown}>
                    <span className="absolute inset-0 overflow-hidden rounded-full pointer-events-none z-0">
                        {avatarRipple.rippleNode}
                    </span>
                    <div className="relative z-10">
                        <div 
                            className="w-8 h-8 rounded-full btn-default-silver-border flex items-center justify-center cursor-pointer hover:from-red-500 hover:to-red-700 transition-all overflow-hidden p-1"
                        >
                            {avatarUrl ? (
                                <img 
                                    src={avatarUrl} 
                                    alt="History avatar" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <i className="fas fa-mask text-xs text-white"></i>
                            )}
                        </div>
                    </div>
                        <div className="relative z-10 flex items-center min-w-0">
                            <span className="text-white text-sm font-medium leading-none break-words line-clamp-2">
                                {historyTitle}
                            </span>
                        </div>
                </div>
                <div className="flex space-x-2">
                    <button 
                        onClick={handleGemsClick}
                        className="backdrop-blur-sm btn-default-silver-border-transparent rounded-full h-10 w-12 rounded-full hover:bg-primary-600 transition relative cursor-pointer"
                        style={glassStyle}
                        onPointerDown={gemsRipple.onPointerDown}
                    >
                        <span className="absolute inset-0 overflow-hidden rounded-full pointer-events-none z-0">
                            {gemsRipple.rippleNode}
                        </span>
                        <span className="relative z-10">
                            <i className="fa-solid fa-gem text-secondary-gradient text-2xl"></i>
                            <div className="absolute -top-6 -right-6 bg-secondary-gradient text-white text-[10px] rounded-full min-w-[22px] h-5 px-1 flex items-center justify-center font-bold">
                                {user.user?.balance || 0}
                            </div>
                        </span>
                    </button>
                        <button 
                            onClick={handleEnergyClick} 
                            className="backdrop-blur-sm btn-default-silver-border-transparent rounded-full h-10 w-12 rounded-full hover:bg-primary-600 transition relative cursor-pointer"
                            style={glassStyle}
                            onPointerDown={energyRipple.onPointerDown}
                        >
                            <span className="absolute inset-0 overflow-hidden rounded-full pointer-events-none z-0">
                                {energyRipple.rippleNode}
                            </span>
                            <span className="relative z-10">
                                <i className="fa-solid fa-bolt text-user-message-gradient text-2xl"></i>
                                <div className="absolute -top-6 -right-6 bg-user-message text-white text-[10px] rounded-full min-w-[22px] h-5 px-1 flex items-center justify-center font-bold">
                                    {user.energy}
                                </div>
                            </span>
                        </button>
                        <button 
                            onClick={handleLanguageClick}
                            className="backdrop-blur-sm btn-default-silver-border-transparent rounded-full h-10 w-12 rounded-full hover:bg-primary-600 transition flex items-center justify-center cursor-pointer"
                            style={glassStyle}
                            title={t('language')}
                            onPointerDown={languageRipple.onPointerDown}
                        >
                            <span className="absolute inset-0 overflow-hidden rounded-full pointer-events-none z-0">
                                {languageRipple.rippleNode}
                            </span>
                            <span className="relative z-10 text-xs text-white font-medium">{language.toUpperCase()}</span>
                        </button>
                </div>
            </div>

            <GemsInfoModal
                isOpen={gemsInfoOpen}
                onClose={() => setGemsInfoOpen(false)}
            />
            <EnergyInfoModal
                isOpen={energyInfoOpen}
                onClose={() => setEnergyInfoOpen(false)}
            />
        </div>
    );
});

export default Header;
