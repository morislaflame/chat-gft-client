import React, { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import { Context, type IStoreContext } from '@/store/StoreProvider';
import Navigation from './Navigation';
import { MAIN_ROUTE, QUESTS_ROUTE, FRIENDS_ROUTE, REWARDS_ROUTE, STORE_ROUTE } from '@/utils/consts';
import HistorySelectionModal from '@/components/modals/HistorySelectionModal';


const Header: React.FC = observer(() => {
    const { user, chat } = useContext(Context) as IStoreContext;
    const location = useLocation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('chat');
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isNavigationCollapsed, setIsNavigationCollapsed] = useState(false);
    
    useEffect(() => {
        switch (location.pathname) {
            case MAIN_ROUTE:
                setActiveTab('chat');
                break;
            case QUESTS_ROUTE:
                setActiveTab('quests');
                break;
            case FRIENDS_ROUTE:
                setActiveTab('friends');
                break;
            case REWARDS_ROUTE:
                setActiveTab('rewards');
                break;
            case STORE_ROUTE:
                setActiveTab('store');
                break;
            default:
                setActiveTab('chat');
        }
    }, [location.pathname]);
    
    const handleStarsClick = () => {
        setActiveTab('store');
        navigate(STORE_ROUTE);
    }

    const handleGemsClick = () => {
        setActiveTab('rewards');
        navigate(REWARDS_ROUTE);
    }

    const handleAvatarClick = () => {
        setIsHistoryModalOpen(true);
    }

    const handleHistoryModalClose = () => {
        setIsHistoryModalOpen(false);
        // Перезагружаем историю чата после выбора истории
        if (location.pathname === MAIN_ROUTE) {
            chat.loadChatHistory();
            chat.loadStatus();
        }
    }


    return (
        <div className="fixed top-0 left-0 w-full z-20 transition-transform duration-300 flex flex-col justify-center items-center">
            {/* App Header */}
            <div className="bg-primary-800 py-3 px-4 flex items-center justify-between border-b border-primary-700 w-full">
                <div className="flex items-center space-x-3 cursor-pointer"
                onClick={handleAvatarClick}>
                    <div className="relative">
                        <div 
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center cursor-pointer hover:from-red-500 hover:to-red-700 transition-all"
                            
                        >
                            {/* <span className="font-bold text-xl"></span> */}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-primary-800"></div>
                    </div>
                    <div>
                        {/* <div className="font-bold text-gray-300 text-sm mb-1">
                            {user.user?.firstName || user.user?.username || 'Dark Lord'}
                        </div> */}
                        <div className="flex items-center space-x-2 text-xs">
                            {/* <div className="w-16 h-1.5 bg-primary-700 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-gradient-to-r from-red-400 to-red-600 energy-fill" 
                                    style={{ width: `${user.user?.energy || 0}%` }}
                                >
                                </div>
                            </div> */}
                            <span className="text-gray-300 text-xs font-medium">
                                {(() => {
                                    const historyName = user.user?.selectedHistoryName || 'starwars';
                                    const historyDisplayNames: Record<string, { en: string; ru: string }> = {
                                        starwars: { en: 'Star Wars', ru: 'Звёздные Войны' },
                                    };
                                    const userLanguage = (user.user?.language || 'en') as 'en' | 'ru';
                                    const displayName = historyDisplayNames[historyName];
                                    if (displayName) {
                                        return displayName[userLanguage];
                                    }
                                    return historyName.charAt(0).toUpperCase() + historyName.slice(1);
                                })()}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button 
                        onClick={handleGemsClick}
                        className="bg-primary-700 h-8 w-12 rounded-full hover:bg-primary-600 transition relative cursor-pointer"
                    >
                        <i className="fa-solid fa-gem text-amber-400 text-lg"></i>
                        <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] rounded-full min-w-[22px] h-5 px-1 flex items-center justify-center font-bold">
                            {user.user?.balance || 0}
                        </div>
                    </button>
                        <button 
                            onClick={handleStarsClick}
                            className="bg-primary-700 h-8 w-12 rounded-full hover:bg-primary-600 transition relative cursor-pointer"
                        >
                            <i className="fa-solid fa-bolt text-purple-400 text-lg"></i>
                        <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-[10px] rounded-full min-w-[22px] h-5 px-1 flex items-center justify-center font-bold">
                            {user.energy}
                        </div>
                        </button>
                        <button 
                            onClick={() => {}}
                            className="bg-primary-700 h-8 w-12 rounded-full hover:bg-primary-600 transition flex items-center justify-center space-x-1 cursor-pointer"
                        >
                            <i className="fas fa-globe text-gray-300 text-sm "></i>
                            <span className="text-xs">{user.user?.language?.toUpperCase() || 'EN'}</span>
                        </button>
                </div>
            </div>
            <motion.div
                animate={{ height: isNavigationCollapsed ? 0 : 'auto' }}
                initial={false}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ overflow: 'hidden', width: '100%' }}
            >
                <Navigation
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
            </motion.div>
            
            {/* Collapse/Expand Button - только на MainPage */}
            {location.pathname === MAIN_ROUTE && (
                <div 
                    onClick={() => setIsNavigationCollapsed(!isNavigationCollapsed)}
                    className="w-[64px] bg-primary-800 border-b border-primary-700 cursor-pointer hover:bg-primary-700 transition-colors"
                    style={{borderBottomRightRadius: '12px', borderBottomLeftRadius: '12px'}}
                >
                    <div className="flex items-center justify-center py-1">
                        <i className={`fas ${isNavigationCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'} text-gray-400 text-xs`}></i>
                    </div>
                </div>
            )}
            
            {/* History Selection Modal */}
            <HistorySelectionModal
                isOpen={isHistoryModalOpen}
                onClose={handleHistoryModalClose}
            />
        </div>
    );
});

export default Header;
